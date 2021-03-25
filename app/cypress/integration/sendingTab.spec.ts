/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

/* eslint-disable prefer-arrow-callback */

const navigateToStaking = () => {
  cy.dataCy('Navigation tabs')
    .contains('Staking')
    .click()

  cy.contains('Staking balance').should('be.visible')
  cy.contains('Current Delegation').should('be.visible')
  cy.contains('Staking and Rewards History').should('be.visible')
  cy.contains('Delegate Stake')
    .as('DelegateAccordion')
    .should('be.visible')

  // expand delegation card if it is hidden
  cy.dataCy('Delegate button')
    .as('DelegateButton')
    .then(($button) => {
      // @ts-ignore: Is exists for a jquery button
      if (!$button.is(':visible')) {
        cy.get('@DelegateAccordion').click()
      }
    })
}

describe('Critical functionality', () => {
  beforeEach('Logs in via UI', () => {
    const mnemonic =
      'bounce tissue tent monitor educate book neglect install armed note explain country maximum strike search'
    cy.visit('/')
    cy.contains('Welcome to AdaLite wallet')
    cy.contains('Continue to AdaLite').click()
    cy.contains('Mnemonic').click()
    cy.contains('Unlock')
      .should('be.visible')
      .should('be.disabled')
    cy.dataCy('Mnemonic text field')
      .should('be.empty')
      .type(mnemonic)
      .should('have.value', mnemonic)
    cy.contains('Unlock').click()
    cy.url().should('include', '/txHistory')
    cy.contains('AdaLite News')
    cy.contains('Close').click()
  })

  beforeEach('Lands on sending page in a valid wallet', () => {
    cy.contains('Available balance')
    cy.dataCy('Send balance amount')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', 5)
    cy.dataCy('Send button')
      .as('SendButton')
      .should('be.visible')
      .should('be.disabled')
    cy.contains('Max')
      .as('MaxButton')
      .should('be.visible')
      .should('be.disabled')
  })

  it('Sends a valid transaction', () => {
    const sendAddress =
      'addr_test1qzlaya83y9uxd2vpcfthjpefhgs2xxvc57m2epvvaj6m9r6jk3jrkjzr07qreswfvj55xvkmyayluf49gvygu5htl35q8uuu7e'
    const sendAmount = '50'

    cy.dataCy('Address text field').type(sendAddress)
    cy.get('@MaxButton').should('be.enabled')

    cy.dataCy('Send amount field')
      .type(sendAmount)
      .should('have.value', sendAmount)
    cy.contains('Calculating fee...')

    cy.get('@SendButton').should('be.enabled')

    cy.dataCy('Send fee amount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('FeeAmount')
      .should('be.gt', 0.1)

    cy.get('@SendButton').click()
    cy.contains('Transaction review').should('be.visible')
    cy.contains(sendAddress).should('be.visible')
    // total is the sum of previously seen fee and input amount
    cy.dataCy('Send amount total')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should(function($totalAmount) {
        expect($totalAmount).to.eq(this.FeeAmount + parseFloat(sendAmount))
      })

    cy.contains('Confirm Transaction').click()
    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet info...').should('be.visible')
    cy.contains('Transaction successful!').should('be.visible')
  })

  it('Validates sending form', () => {
    const sendAddress =
      'addr_test1qzlaya83y9uxd2vpcfthjpefhgs2xxvc57m2epvvaj6m9r6jk3jrkjzr07qreswfvj55xvkmyayluf49gvygu5htl35q8uuu7e'

    // incomplete address
    cy.dataCy('Address text field').type(sendAddress.substr(0, 5))

    cy.get('@MaxButton').should('be.disabled')
    cy.get('@SendButton').should('be.disabled')

    cy.dataCy('Send fee amount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should('be.eq', 0)

    // now a valid complete address
    cy.contains('Invalid address').should('be.visible')
    cy.dataCy('Address text field').type(sendAddress.substr(5))
    cy.contains('Invalid address').should('not.exist')

    cy.get('@MaxButton').should('be.enabled')
    cy.get('@SendButton').should('be.disabled')

    // amount error checks
    cy.dataCy('Send amount field').type('-1')
    cy.contains('Amount has to be a positive number').should('be.visible')

    cy.dataCy('Send amount field')
      .clear()
      .type('0')
    cy.contains('Amount has to be a positive number').should('be.visible')

    cy.dataCy('Send amount field')
      .clear()
      .type('0.1')
    cy.contains('Amount too low').should('be.visible')
  })

  it('Sends a valid asset transaction', () => {
    const sendAddress =
      'addr_test1qzlaya83y9uxd2vpcfthjpefhgs2xxvc57m2epvvaj6m9r6jk3jrkjzr07qreswfvj55xvkmyayluf49gvygu5htl35q8uuu7e'
    cy.dataCy('Address text field').type(sendAddress)
    cy.contains('Invalid address').should('not.exist')

    cy.dataCy('Send Asset dropdown').click()
    cy.dataCy('Send Asset dropdown token item')
      .as('TokenItem')
      .dataCy('Send Asset token quantity')
      .invoke('text')
      .as('TokenQuantity')

    cy.get('@TokenItem').click()
    cy.get('@MaxButton').click()
    cy.contains('Calculating fee...').should('be.visible')
    cy.get('@SendButton').should('be.enabled')

    cy.dataCy('Send fee amount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('FeeAmount')
      .should('be.gt', 0.1)

    cy.dataCy('Send asset min ada amount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('MinAmount')
      .should('be.gt', 1)

    cy.get('@SendButton').click()
    cy.contains('Transaction review').should('be.visible')
    cy.contains(sendAddress).should('be.visible')
    // confirm token amount is the equals the previously selected token amount
    cy.dataCy('Send token amount')
      .should('be.visible')
      .invoke('text')
      .should(function($tokenAmount) {
        expect($tokenAmount).to.eq(this.TokenQuantity)
      })
    // total is the sum of previously seen fee and min ada amount
    cy.dataCy('Send amount total')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .should(function($totalAmount) {
        expect($totalAmount).to.eq(this.FeeAmount + this.MinAmount)
      })

    cy.contains('Confirm Transaction').click()
    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet info...').should('be.visible')
    cy.contains('Transaction successful!').should('be.visible')
  })

  it('Validate receive tab addresses', () => {
    cy.dataCy('Navigation tabs')
      .contains('Receive')
      .click()

    cy.contains('My Addresses')

    // first is shown,
    cy.dataCy('Receive address item')
      .as('AddressItems')
      .should('have.length', 20)
      .first()
      .contains('Copy Address')
      .should('be.visible')
      .click()

    // second is hidden
    cy.get('@AddressItems')
      .eq(1)
      .contains('Copy Address')
      .should('not.be.visible')

    // expand second address
    cy.dataCy('Receive address accordion')
      .eq(1)
      .click()

    // first is hidden,
    cy.get('@AddressItems')
      .eq(0)
      .contains('Copy Address')
      .should('not.be.visible')

    // second is shown
    cy.get('@AddressItems')
      .eq(1)
      .contains('Copy Address')
      .should('be.visible')
  })

  it('Delegate to a valid pool', () => {
    navigateToStaking()
    const poolId = '48f2c367cfe81cac6687c3f7c26613edfe73cd329402aa5cf493bb61'
    cy.dataCy('Pool delegation text field')
      .should('be.visible')
      .clear()
      .type(poolId)

    cy.get('@DelegateButton').should('be.enabled')
    cy.dataCy('Delegate fee amount')
      .should('be.visible')
      .invoke('text')
      .then(parseFloat)
      .as('FeeAmount')
      .should('be.gt', 0.1)
    cy.get('@DelegateButton').click()

    cy.contains('Delegation review').should('be.visible')
    cy.contains(poolId).should('be.visible')
    cy.contains('Confirm Transaction').click()

    cy.contains('Submitting transaction...').should('be.visible')
    cy.contains('Reloading wallet info...').should('be.visible')
    cy.contains('Reloading wallet info...').should('not.exist')
  })

  it('Validate invalid stake pool id', () => {
    navigateToStaking()
    const poolId = 'invalid_id'
    cy.dataCy('Pool delegation text field')
      .should('be.visible')
      .clear()
      .type(poolId)

    cy.contains('Enter a valid stakepool id.').should('be.visible')
    cy.get('@DelegateButton')
      .should('be.disabled')
      .and('be.visible')
  })

  it('Validates initial state of advanced tab', () => {
    cy.dataCy('Navigation tabs')
      .contains('Advanced')
      .click()

    cy.dataCy('Advanced key card').should('be.visible')
    cy.dataCy('Pool registration card').should('be.visible')
    // disabled for mnemonic users
    cy.contains('Select a transaction file').should('be.visible')
    // .and('be.disabled')
    cy.dataCy('Advanced sign button')
      .should('be.visible')
      .and('be.disabled')
    cy.dataCy('Advanced download signature button')
      .should('be.visible')
      .and('be.disabled')

    cy.dataCy('Download stake key')
      .should('be.visible')
      .and('not.have.attr', 'href', '#undefined')
  })
})
