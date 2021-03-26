/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference path="../support/index.d.ts" />

describe('Account tab', () => {
  beforeEach('Navigates to Account tab', () => {
    cy.dataCy('Navigation tabs')
      .contains('Account ')
      .click()
  })
})
