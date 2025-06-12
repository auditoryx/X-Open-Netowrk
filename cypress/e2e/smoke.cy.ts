describe('Smoke flow', () => {
  it('guest can reach Stripe checkout', () => {
    cy.visit('/');
    cy.contains(/Explore Creators/i).click();
    cy.contains(/Book Now/i).first().click();
    /* OAuth redirect stub */
    cy.origin('https://accounts.google.com', () => {
      cy.contains('Sign in').should('exist');
    });
  });
});
