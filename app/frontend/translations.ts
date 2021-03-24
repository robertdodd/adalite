import printAda from './helpers/printAda'
import debugLog from './helpers/debugLog'
import {ADALITE_CONFIG} from './config'
import {LEDGER_VERSIONS, TREZOR_VERSIONS} from './wallet/constants'
import {Lovelace, CryptoProviderFeature} from './types'
import {Errors} from './errors'

const {ADALITE_MIN_DONATION_VALUE} = ADALITE_CONFIG

const ledgerTroubleshootingSuggestion =
  'If you are using Ledger, please make sure Ledger Live app is closed and try connecting your device using the "Connect with WebUSB" functionality (the button underneath "Unlock with Ledger"). For more information please read the section concerning Ledger in our troubleshooting suggestions.'

const translations: {[key in Errors]: (message?: any) => string} = {
  [Errors.SendAddressInvalidAddress]: () => 'Invalid address',
  [Errors.SendAmountIsNan]: () => 'Invalid format: Amount has to be a number',
  [Errors.SendAmountIsNotPositive]: () => 'Invalid format: Amount has to be a positive number',
  [Errors.SendAmountInsufficientFunds]: ({balance}) =>
    `Insufficient funds for the transaction. Your balance is ${printAda(balance)} ADA.`,
  [Errors.SendAmountCantSendAnyFunds]: () =>
    'Sending funds is not possible since there is not enough balance to pay the transaction fee',
  [Errors.SendAmountPrecisionLimit]: () => 'Invalid format: Maximum allowed precision is 0.000001',
  [Errors.SendAmountIsTooBig]: () =>
    `Invalid format: Amount cannot exceed ${printAda(Number.MAX_SAFE_INTEGER as Lovelace)}`,
  [Errors.TokenAmountOnlyWholeNumbers]: () =>
    'Invalid format: Asset amount has to be a whole number',
  [Errors.TokenAmountInsufficientFunds]: ({tokenBalance}) =>
    `Insufficient funds for the transaction. Your balance is ${tokenBalance}`,
  [Errors.SendTokenNotMinimalLovelaceAmount]: ({minimalLovelaceAmount}) =>
    `Insufficient funds for the transaction, the minimal amount of ADA for sending the tokens is ${printAda(
      minimalLovelaceAmount
    )}`,
  [Errors.DonationAmountTooLow]: () => `Minimum donation is ${ADALITE_MIN_DONATION_VALUE} ADA`,
  [Errors.DonationInsufficientBalance]: () => 'Insufficient balance for the donation.',

  [Errors.InvalidStakepoolIdentifier]: ({hasTickerMapping}) =>
    `Enter a valid ${hasTickerMapping ? 'ticker or ' : ''}stakepool id.`,
  [Errors.TickerSearchDisabled]: ({hasTickerMapping}) => 'Search by ticker is temporary disabled',
  [Errors.RedundantStakePool]: () => 'This stake pool is already chosen.',
  [Errors.DelegationBalanceError]: () => 'Not enough funds to pay the delegation fee.',
  [Errors.DelegationFeeError]: () => 'Unsuccessful delegation fee calculation.',
  [Errors.RewardsBalanceTooLow]: () =>
    'Rewards account balance lower than the fee required to pay for the transacion.',

  [Errors.InvalidMnemonic]: () => 'Invalid mnemonic, check your mnemonic for typos and try again.',
  [Errors.DaedalusMnemonic]: () => '',

  [Errors.TransportOpenUserCancelled]: ({message}) => {
    const errors = {
      'navigator.usb is undefined':
        'Your browser does not support WebUSB, use e.g. Google Chrome instead.',
    }

    return `TransportCanceledByUser: ${message}. ${errors[message] || ''}`
  },
  [Errors.TransportError]: ({message}) =>
    `TransportError: ${message}.If you are using a hardware wallet, please make sure you are using the latest version of the Cardano application.`,
  [Errors.TransportStatusError]: ({message}) => {
    const errors = {
      'Ledger device: Wrong Ledger app':
        'Please make sure that the Cardano Ledger App is opened before initiating the connection.',
      'Ledger device: Device is locked': 'Please unlock your device.',
    }
    return `TransportStatusError: ${message}. ${errors[message] || ''}`
  },
  [Errors.TransportInterfaceNotAvailable]: ({message}) => {
    const errors = {
      'Unable to claim interface.':
        'Please make sure that no other web page/app is interacting with your Ledger device at the same time.',
    }
    return `TransportInterfaceNotAvailable: ${message} ${errors[message] || ''}`
  },
  [Errors.DisconnectedDeviceDuringOperation]: () =>
    `DisconnectedDeviceDuringOperation: ${ledgerTroubleshootingSuggestion}`,
  [Errors.TransportWebUSBGestureRequired]: () =>
    `TransportWebUSBGestureRequired: ${ledgerTroubleshootingSuggestion}`,
  [Errors.NotFoundError]: () => `NotFoundError: ${ledgerTroubleshootingSuggestion}`,
  [Errors.AbortError]: () => `NotFoundError: ${ledgerTroubleshootingSuggestion}`,
  [Errors.SecurityError]: () => `Access denied: ${ledgerTroubleshootingSuggestion}`,

  [Errors.TransactionRejectedByNetwork]: () =>
    'TransactionRejectedByNetwork: Submitting the transaction into Cardano network failed. We received this error and we will investigate the cause.',
  [Errors.TransactionRejectedWhileSigning]: ({message}) =>
    `Transaction rejected while signing${
      message
        ? `:  ${message}`
        : '.If you are using a Ledger, please make sure you are using the latest version of the Cardano application. If you are using Trezor, please make sure your Trezor firmware is updated.'
    }`,
  [Errors.TransactionCorrupted]: () => 'TransactionCorrupted: Transaction assembling failure.',
  [Errors.TransactionNotFoundInBlockchainAfterSubmission]: ({txHash}) =>
    `TransactionNotFoundInBlockchainAfterSubmission: 
    Transaction ${txHash ||
      ''} not found in blockchain after being submitted, check it later please.`,
  [Errors.TxSerializationError]: ({message}) => `TxSerializationError: ${message}`,

  [Errors.TrezorRejected]: () =>
    'TrezorRejected: Operation rejected by the Trezor hardware wallet.',
  [Errors.TrezorSignTxError]: ({message}) => `TrezorSignTxError: ${message}`,
  [Errors.TrezorError]: ({message}) =>
    `TrezorError: Trezor operation failed, please make sure ad blockers are switched off for this site and you are using the latest version of Trezor firmware. ${message}`,
  [Errors.LedgerOperationError]: ({message}) =>
    `LedgerOperationError: ${message}. Please make sure you are using the latest version of the Cardano application.`,

  [Errors.CoinAmountError]: () => 'CoinAmountError: Unsupported amount of coins.',
  [Errors.OutputTooSmall]: () =>
    'OutputTooSmall: Not enough funds to make this transaction, try sending a different amount.',
  [Errors.ChangeOutputTooSmall]: () =>
    'ChangeOutputTooSmall: Not enough funds to make this transaction, try sending a different amount.',
  [Errors.TxTooBig]: () => 'Transaction is too big, try sending lesser amount of coins.',
  [Errors.OutputTooBig]: () => 'Transaction output is too big, try sending a diffrent amount.',

  [Errors.SendAmountTooLow]: () => 'Amount too low. Minimum amount to send is 1 ADA',
  [Errors.SendAmountBalanceTooLow]: () => 'Minimum output amount is 1 ADA.',
  [Errors.CryptoProviderError]: ({message}) => `CryptoProviderError: ${message}`,
  [Errors.NetworkError]: () =>
    'NetworkError: Request to our servers has failed. Please check your network connection and if the problem persists, contact us.',
  [Errors.ServerError]: () =>
    'ServerError: Our servers are probably down. Please try again later and if the problem persists, contact us.',

  [Errors.LedgerMultiAssetNotSupported]: () =>
    'LedgerMultiAssetNotSupported: Sending tokens is not supported on Ledger device. Please update your cardano application to the latest version.',
  [Errors.LedgerOutdatedCardanoAppError]: ({message}) =>
    `LedgerOutdatedCardanoAppError: Your cardano application is running on an outdated version ${message}. Please update your cardano application to the version ${
      LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.MINIMAL].patch
    } or later. See https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps for more information.`,
  [Errors.LedgerWithdrawalNotSupported]: ({message}) =>
    `RewardsWithdrawalNotSupported: There was a bug in Ledger Cardano app 2.0.3 that didn't allow rewards withdrawals. To withdraw rewards, you need to update your Ledger firmware and your Ledger Cardano app. You need to update to firmware version 1.6.1 for Ledger Nano S and to firmware version 1.2.4-4 for Nano X. For more information how to do this please refer to https://support.ledger.com/hc/en-us/articles/360005885733-Update-device-firmware. After your ledger firmware is updated please install the latest version of the the Ledger Cardano app. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.WITHDRAWAL].patch
    }. For more information how to do this, please refer to https://support.ledger.com/hc/en-us/articles/360006523674-Install-uninstall-and-update-apps`,
  [Errors.LedgerPoolRegNotSupported]: ({message}) =>
    `Pool registration is not supported on this device. Your current version is ${message} and the required version is ${
      LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].major
    }.${LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].minor}.${
      LEDGER_VERSIONS[CryptoProviderFeature.POOL_OWNER].patch
    }`,
  [Errors.TrezorPoolRegNotSupported]: ({message}) =>
    `Pool registration is not supported on this device. Your current version is ${message} and the required version is ${
      TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].major
    }.${TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].minor}.${
      TREZOR_VERSIONS[CryptoProviderFeature.POOL_OWNER].patch
    }`,
  [Errors.TrezorMultiAssetNotSupported]: () =>
    'TrezorMultiAssetNotSupported: Sending tokens is not supported on Trezor device. Please update your firmware to the latest version.',

  [Errors.PoolRegInvalidNumCerts]: () =>
    'The transaction must include exactly one certificate, being the pool registration.',
  [Errors.PoolRegInvalidType]: () => 'The certificate in transaction is not a pool registration.',
  [Errors.PoolRegWithdrawalDetected]: () => 'The transaction must not include withdrawals.',
  [Errors.PoolRegInvalidFileFormat]: () =>
    'Specified file is not a cli-format pool registration certificate transaction.',
  [Errors.PoolRegIncorrectBufferLength]: ({message}) =>
    `Given property has incorrect byte length: ${message}.`,
  [Errors.PoolRegInvalidNumber]: ({message}) => `Given property is not a valid number: ${message}.`,
  [Errors.PoolRegDuplicateOwners]: () => 'The certificate contains duplicate owner hashes.',
  [Errors.PoolRegNotTheOwner]: () =>
    'This HW device is not an owner of the pool stated in registration certificate.',
  [Errors.PoolRegInvalidMargin]: () => 'The given pool margin is not valid.',
  [Errors.PoolRegInvalidRelay]: () => 'Relay type is incorrect.',
  [Errors.PoolRegInvalidMetadata]: () =>
    'Pool metadata must be either empty or contain both url and metadata hash.',
  [Errors.PoolRegNoHwWallet]: () => 'Only hardware wallet users can use this feature.',
  [Errors.PoolRegNoTtl]: () =>
    'TTL parameter is missing in the transaction. It is explicitly required even for the Allegra era.',
  [Errors.PoolRegTxParserError]: ({message}) =>
    `Parser error: Invalid transaction format. ${message}`,
  [Errors.InvalidDataProviderInitilization]: () => 'Invalid data provider initilization',

  [Errors.Error]: ({message}) => {
    const errors = {
      'NotFoundError: The device was disconnected.': `${message}${ledgerTroubleshootingSuggestion}`,
      'AbortError: The transfer was cancelled.': `${message}${ledgerTroubleshootingSuggestion}`,
      // an issue with CryptoToken extension allowing 2-step verification
      // https://askubuntu.com/questions/844090/what-is-cryptotokenextension-in-chromium-extensions
      "SyntaxError: Failed to execute 'postMessage' on 'Window': Invalid target origin 'chrome-extension://kmendfapggjehodndflmmgagdbamhnfd' in a call to 'postMessage'": `${message}${ledgerTroubleshootingSuggestion}`,
    }
    // we return undefined in case of unmached message on purpose since we
    // want to treat such errors as unexpected
    return errors[message]
  },
}

function getTranslation(code: Errors, params = {}) {
  if (!translations[code]) {
    debugLog(`Translation for ${code} not found!`)
    return null
  }
  return translations[code](params)
}

export {getTranslation}
