describe('Kompletní nákupní proces od detailu po zobrazení vstupenky', () => {

  const createFakeToken = () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: "user@test.cz", role: "USER", exp: 9999999999 }));
    return `${header}.${payload}.signature`;
  };

  it('by měl umožnit přidání vstupenky, platbu a zobrazení v seznamu zakoupených', () => {
    const eventId = 10;
    const ticketPrice = 1590;
    const eventName = 'Koncert Imagine Dragons';
    const venueName = 'O2 Arena';

    cy.intercept('GET', '**/api/auth/me', { statusCode: 200, body: { email: "user@test.cz", role: "USER" }}).as('getMe');

    cy.intercept('GET', `**/api/events/${eventId}`, { statusCode: 200, body: { id: eventId, name: eventName, startTime: new Date().toISOString(), venue: { id: 1, name: venueName }, standingPrice: ticketPrice }}).as('getEventDetail');
    
    cy.intercept('POST', '**/api/carts/items', { statusCode: 200, body: { success: true }}).as('addToCart');
    
    cy.intercept('GET', '**/api/carts/me', { statusCode: 200, body: { id: 1, items: [{ ticketId: 101, eventId: eventId, eventName: eventName, eventStartTime: new Date().toISOString(), venue: { id: 1, name: venueName }, price: ticketPrice, status: 'RESERVED' }], itemsCount: 1, total: ticketPrice }}).as('getCart');
    
    cy.intercept('POST', '**/api/orders', { statusCode: 200, body: { message: 'Order created successfully' }}).as('createOrder');

    const mockTicketData = {
        id: 555,
        ticketCode: 'A1B2-C3D4-E5F6',
        price: ticketPrice,
        type: "STANDING",
        status: "PAID",
        eventName: eventName,
        eventStart: new Date().toISOString(),
        venue: { name: venueName, address: 'Praha' },
    };

    cy.intercept('GET', '**/api/tickets/me*', {
        statusCode: 200,
        body: { content: [mockTicketData], last: true }
    }).as('getMyTickets');

    cy.visit(`/events/${eventId}`, {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("token", createFakeToken());
      },
    });
    cy.wait('@getEventDetail');

    cy.contains('button', 'Do košíku').click();
    cy.wait(['@addToCart', '@getCart']);
    cy.url().should('include', '/cart');

    cy.clock();
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);
    cy.contains('button', 'Zaplatit objednávku').should('not.be.disabled').click();
    cy.tick(1500);
    cy.wait('@createOrder');

    cy.wrap(alertStub).should('have.been.calledWith', 'Platba proběhla úspěšně!\nVstupenky byly odeslány na váš email.');

    cy.wait('@getMyTickets');
    cy.url().should('include', '/user/tickets');
    
    cy.contains('h1', 'Moje vstupenky').should('be.visible');
    
    cy.contains('div[class*="card"]', eventName).within(() => {
        cy.contains(venueName).should('be.visible');
        cy.contains('Na stání').should('be.visible');
        cy.contains(`${ticketPrice} Kč`).should('be.visible');
        cy.contains('A1B2-C3D4-E5F6').should('be.visible');
    });
  });
});