/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

/* eslint-disable prefer-arrow-callback */
describe('Sending tab', () => {
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
})
