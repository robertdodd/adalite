const TrezorConnect = require('trezor-connect')
const BlockchainExplorer = require('./blockchain-explorer')
const derivePublic = require('./helpers/derivePublic')
const {packAddress, unpackAddress} = require('./address')

const CardanoTrezorCryptoProvider = (CARDANOLITE_CONFIG, walletState) => {
  const state = Object.assign(walletState, {
    derivedXpubs: {},
    rootHdPassphrase: null,
    derivedAddresses: {},
  })

  const blockchainExplorer = BlockchainExplorer(CARDANOLITE_CONFIG, state)

  function normalizePathsForTrezor(derivationPaths) {
    return derivationPaths.map((path) => {
      // 44'/1815'
      let trezorPath = [2147483692, 2147485463]

      if (path.length === 2) {
        trezorPath = [...trezorPath, path[0], 0, path[1]]
      } else if (path.length === 1) {
        trezorPath = [...trezorPath, path[0]]
      }

      return trezorPath
    })
  }

  async function getWalletId() {
    return await deriveAddress([], 'hardened')
  }

  async function deriveAddresses(derivationPaths, derivationMode) {
    const addresses = []

    derivationPaths = derivationPaths.filter((path) => {
      const cachedAddress = state.derivedAddresses[JSON.stringify(path)]
      if (cachedAddress) {
        addresses.push(cachedAddress.address)
        return false
      }

      return true
    })

    if (!derivationPaths.length) {
      return addresses
    }

    let newAddresses = []
    if (derivationMode === 'hardened') {
      newAddresses = await _trezorDeriveAddresses(derivationPaths, true)
    } else {
      for (const derivationPath of derivationPaths) {
        newAddresses.push(await deriveAddress(derivationPath, derivationMode))
      }
    }

    return addresses.concat(newAddresses)
  }

  function getKeyFromTrezorDerivationPath(path) {
    switch (path.length) {
      case 5:
        return [path[2], path[4]]
      case 3:
        return [path[2]]
      case 0:
        return []
      default:
        throw Error(`Unsupported derivation path: ${path}`)
    }
  }

  async function _trezorDeriveAddresses(derivationPaths, displayConfirmation) {
    return await new Promise((resolve, reject) => {
      const paths = normalizePathsForTrezor(derivationPaths)

      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaGetAddresses(paths, displayConfirmation, (response) => {
          if (response.success) {
            const addresses = response.addresses.map((address) => {
              const path = getKeyFromTrezorDerivationPath(address.address_n)

              state.derivedAddresses[JSON.stringify(path)] = {
                derivationPath: path,
                address: address.address,
              }

              return address.address
            })

            resolve(addresses)
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  async function _trezorDeriveAddress(derivationPath, displayConfirmation) {
    return await new Promise((resolve, reject) => {
      const path = normalizePathsForTrezor([derivationPath])[0]

      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaGetAddress(path, displayConfirmation, (response) => {
          if (response.success) {
            state.derivedAddresses[JSON.stringify(derivationPath)] = {
              derivationPath,
              address: response.address,
            }

            resolve(response.address)
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  async function deriveAddress(derivationPath, derivationMode) {
    const cachedAddress = state.derivedAddresses[JSON.stringify(derivationPath)]
    if (cachedAddress) {
      return cachedAddress.address
    }

    if (derivationMode === 'hardened') {
      return await _trezorDeriveAddress(derivationPath, true)
    } else {
      const xpub = await deriveXpub(derivationPath, derivationMode)
      const hdPassphrase = new Buffer(await getRootHdPassphrase(), 'hex')

      const address = packAddress(derivationPath, xpub, hdPassphrase)
      state.derivedAddresses[JSON.stringify(derivationPath)] = {
        derivationPath,
        address,
      }

      return address
    }
  }

  async function deriveXpub(derivationPath, derivationMode) {
    const memoKey = JSON.stringify(derivationPath)

    if (!state.derivedXpubs[memoKey]) {
      let result

      if (derivationMode === 'hardened') {
        result = await deriveXpubHardened(derivationPath)
      } else if (derivationMode === 'nonhardened') {
        result = await deriveXpubNonHardened(derivationPath)
      } else {
        throw Error(`Unknown derivation mode: ${derivationMode}`)
      }

      state.derivedXpubs[memoKey] = result
    }

    return state.derivedXpubs[memoKey]
  }

  async function deriveXpubHardened(derivationPath) {
    return new Buffer((await deriveTrezorXpub(derivationPath)).xpub, 'hex')
  }

  async function deriveTrezorXpub(derivationPath) {
    return await new Promise((resolve, reject) => {
      // m/44'/1815'/0'/0/childIndex
      const path = normalizePathsForTrezor([derivationPath])[0]

      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaGetXpubKey(path, (response) => {
          if (response.success) {
            const xpubData = {
              xpub: response.xpub_key,
              root_hd_passphrase: response.root_hd_passphrase,
            }

            if (!state.rootHdPassphrase) {
              state.rootHdPassphrase = new Buffer(response.root_hd_passphrase, 'hex')
            }

            resolve(xpubData)
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  async function deriveXpubNonHardened(derivationPath) {
    const parentPath = derivationPath.slice(0, derivationPath.length - 1)
    const childPath = derivationPath.slice(derivationPath.length - 1, derivationPath.length)

    // this reduce ensures that this would work even for empty derivation path
    return childPath.reduce(derivePublic, await deriveXpub(parentPath, 'hardened'))
  }

  async function isOwnAddress(address) {
    const cachedAddress = Object.values(state.derivedAddresses).find((record) => {
      if (record.address === address) {
        return true
      }

      return false
    })

    if (cachedAddress) {
      return true
    }

    try {
      const hdPassphrase = await getRootHdPassphrase()
      unpackAddress(address, hdPassphrase)
      return true
    } catch (e) {
      if (e.name === 'AddressDecodingException') {
        return false
      }

      throw e
    }
  }

  function deriveHdNode(childIndex) {
    throw new Error('This operation is not supported on TrezorCryptoProvider!')
  }

  async function sign(message, derivationPath) {
    return await new Promise((resolve, reject) => {
      const messageToSign = Buffer.from(message, 'hex').toString('utf8')

      // m/44'/1815'/0'/0/childIndex
      const path = normalizePathsForTrezor([derivationPath])[0]

      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaSignMessage(path, messageToSign, (response) => {
          if (response.success) {
            resolve(new Buffer(response.signature, 'hex'))
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  async function getRootHdPassphrase() {
    if (!state.rootHdPassphrase) {
      const rootHdPassphrase = (await deriveTrezorXpub([])).root_hd_passphrase
      state.rootHdPassphrase = new Buffer(rootHdPassphrase, 'hex')
    }

    return state.rootHdPassphrase
  }

  async function getDerivationPathFromAddress(address) {
    const cachedAddress = Object.values(state.derivedAddresses).find((record) => {
      if (record.address === address) {
        return true
      }

      return false
    })

    if (cachedAddress) {
      return cachedAddress.derivationPath
    } else {
      return unpackAddress(address, await getRootHdPassphrase()).derivationPath
    }
  }

  async function _prepareInput(input) {
    const data = {
      tx_hash: input.txHash,
      output_index: input.outputIndex,
      type: 0,
    }

    const derivationPath = await getDerivationPathFromAddress(input.utxo.address)
    data.address_n = normalizePathsForTrezor([derivationPath])[0]

    return data
  }

  async function _prepareOutput(output) {
    const data = {
      amount: output.coins,
    }

    if (output.isChange) {
      const derivationPath = await getDerivationPathFromAddress(output.address)
      data.address_n = normalizePathsForTrezor([derivationPath])[0]
    } else {
      data.address = output.address
    }

    return data
  }

  async function signTx(unsignedTx) {
    const inputs = []
    for (const input of unsignedTx.inputs) {
      inputs.push(await _prepareInput(input))
    }

    const transactions = []
    for (const input of inputs) {
      const transaction = await blockchainExplorer.fetchTxRaw(input.tx_hash)
      transactions.push(transaction)
    }

    const outputs = []
    for (const output of unsignedTx.outputs) {
      const data = await _prepareOutput(output)
      outputs.push(data)
    }

    const attributes = []

    return await new Promise((resolve, reject) => {
      callTrezor((shouldRejectOnError) => {
        TrezorConnect.adaSignTransaction(inputs, outputs, transactions, attributes, (response) => {
          if (response.success) {
            resolve({txHash: response.tx_hash, txBody: response.tx_body})
          } else {
            if (shouldRejectOnError(response.error)) {
              reject(response.error)
            }
          }
        })
      })
    })
  }

  function callTrezor(callback) {
    callback((error) => {
      if (error === 'Window closed') {
        setTimeout(() => callTrezor(callback), 200)
        return false
      }
      return true
    })
  }

  return {
    deriveAddress,
    deriveAddresses,
    isOwnAddress,
    getWalletId,
    signTx,
    _sign: sign,
    _deriveHdNode: deriveHdNode,
  }
}

module.exports = CardanoTrezorCryptoProvider