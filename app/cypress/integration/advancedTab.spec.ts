/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

describe('Advanced tab', () => {
  beforeEach('Navigates to Advanced tab', () => {
    cy.dataCy('Navigation tabs')
      .contains('Advanced')
      .click()
  })

  it('Validates initial state of advanced tab', () => {
    cy.dataCy('Advanced key card').should('be.visible')
    cy.dataCy('Pool registration card').should('be.visible')
    // disabled for mnemonic users
    cy.contains('Select a transaction file').should('be.visible')
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
