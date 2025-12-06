describe('Testování přihlášení', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173/auth/login');
  });

  it('Úspěšné přihlášení uživatele a přesměrování na /user', () => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.get('input[type="email"]')
      .should('be.visible')
      .type('test@user.com');

    cy.get('input[type="password"]')
      .should('be.visible')
      .type('admin123');

    cy.get('button[type="submit"]')
      .click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    cy.url().should('include', '/user');
    

    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.exist;
    });
  });

  it('Zobrazení chyby při špatném hesle', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Bad credentials' }
    }).as('loginFail');

    cy.get('input[type="email"]').type('test@user.com');
    cy.get('input[type="password"]').type('spatneheslo');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');

    cy.url().should('include', '/auth/login');

    cy.get('[role="alert"]').should('contain', 'Bad credentials');
  });
});