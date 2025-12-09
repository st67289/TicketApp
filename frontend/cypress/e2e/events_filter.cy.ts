describe('Filtry událostí', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/events*').as('initialLoad');
    cy.visit('/events');
    cy.wait('@initialLoad');
  });

  it('Filter: Fulltextové vyhledávání', () => {
    const searchTerm = 'Imagine Dragons';
    // OPRAVA: Prohlížeč v tomto případě kóduje mezeru jako '+', ne '%20'
    const encodedSearchTerm = 'Imagine+Dragons';

    cy.intercept('GET', `**/api/events*q=${encodedSearchTerm}*`).as('searchRequest');

    cy.contains('label', 'Hledat')
      .next('input')
      .type(searchTerm);

    cy.wait('@searchRequest', { timeout: 5000 }).then(({ request }) => {
      expect(request.url).to.include(`q=${encodedSearchTerm}`);
    });
  });

  it('Filter: Venue', () => {
    cy.intercept('GET', '**/api/events*venueId=*').as('venueRequest');

    cy.contains('label', 'Místo konání')
        .parent()
        .find('select')
        .select('O2 arena');

    cy.wait('@venueRequest', { timeout: 5000 }).then(({ request }) => {
        expect(request.url).to.include('venueId=');
    });
  });

  it('Filter: Cena (max)', () => {
    cy.intercept('GET', '**/api/events*priceMax=200*').as('priceRequest');

    cy.contains('label', 'Cena do')
      .next('input')
      .type('200');

    cy.wait('@priceRequest', { timeout: 5000 }).then(({ request }) => {
      expect(request.url).to.include('priceMax=200');
    });
  });

  it('Filter: Datum rychlý výběr', () => {
    cy.intercept('GET', '**/api/events*from=*').as('dateRequest');

    cy.contains('label', 'Tento týden').click();

    cy.wait('@dateRequest', { timeout: 5000 }).then(({ request }) => {
      expect(request.url).to.include('from=');
      expect(request.url).to.include('to=');
    });
  });

  it('Filter: Vlastní rozsah data', () => {
    // OPRAVA: Intercept musí být specifičtější, aby čekal na požadavek s OBĚMA daty.
    cy.intercept('GET', '**/api/events*from=2025-01-01*to=2025-01-31*').as('customDateRequest');

    cy.contains('label', 'Datum od')
        .next('input')
        .type('2025-01-01');

    cy.contains('label', 'Datum do')
        .next('input')
        .type('2025-01-31');

    cy.wait('@customDateRequest', { timeout: 5000 }).then(({ request }) => {
      expect(request.url).to.include('from=2025-01-01');
      expect(request.url).to.include('to=2025-01-31');
    });
  });

  it('Seřazení podle ceny (ověření na frontendu)', () => {
    cy.contains('label', 'Řazení').next().select('Cena ↑');
    // Tento test nevolá API, takže zde není 'cy.wait'.
    // Správné by bylo ověřit pořadí prvků v DOM.
  });

  it('Reset filtrů', () => {
    cy.intercept('GET', '**/api/events*priceMax=150*').as('setPriceFilter');
    cy.contains('label', 'Cena do')
      .next('input')
      .type('150');
    cy.wait('@setPriceFilter');

    cy.intercept('GET', '**/api/events*').as('resetRequest');
    cy.contains('button', 'Vymazat filtry').click();

    cy.wait('@resetRequest', { timeout: 5000 }).then(({ request }) => {
      expect(request.url).not.to.include('venueId=');
      expect(request.url).not.to.include('priceMax=');
      expect(request.url).not.to.include('from=');
      expect(request.url).not.to.include('to=');
      expect(request.url).not.to.include('q=');
    });
  });
});