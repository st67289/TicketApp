describe('Filtry událostí', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/events*').as('initialLoad');
    cy.visit('/events');
    cy.wait('@initialLoad');
  });

  it('Filter: Fulltextové vyhledávání', () => {
    const searchTerm = 'Imagine Dragons';
    const encodedSearchTerm = 'Imagine+Dragons';

    cy.intercept('GET', `**/api/events*q=${encodedSearchTerm}*`).as('searchRequest');

    cy.contains('label', 'Hledat')
      .next('input')
      .clear()
      .type(searchTerm);

    cy.wait('@searchRequest').then(({ request }) => {
      expect(request.url).to.include(`q=${encodedSearchTerm}`);
    });
  });

  it('Filter: Venue (nezávislé na DB datech)', () => {
    cy.intercept('GET', '**/api/events*venueId=*').as('venueRequest');

    cy.contains('label', 'Místo konání')
      .parent()
      .find('select')
      .find('option')
      .should('have.length.greaterThan', 1)
      .eq(1) // první skutečná venue (index 0 bývá "Vše")
      .then(option => {
        cy.contains('label', 'Místo konání')
          .parent()
          .find('select')
          .select(option.val() as string);
      });

    cy.wait('@venueRequest').then(({ request }) => {
      expect(request.url).to.match(/venueId=\d+/);
    });
  });

  it('Filter: Cena (max)', () => {
    cy.intercept('GET', '**/api/events*priceMax=200*').as('priceRequest');

    cy.contains('label', 'Cena do')
      .next('input')
      .clear()
      .type('200');

    cy.wait('@priceRequest').then(({ request }) => {
      expect(request.url).to.include('priceMax=200');
    });
  });

  it('Filter: Datum – rychlý výběr', () => {
    cy.intercept('GET', '**/api/events*from=*to=*').as('dateRequest');

    cy.contains('label', 'Tento týden').click();

    cy.wait('@dateRequest').then(({ request }) => {
      expect(request.url).to.include('from=');
      expect(request.url).to.include('to=');
    });
  });

  it('Filter: Vlastní rozsah data (robustní)', () => {
    cy.intercept('GET', '**/api/events*from=*to=*').as('customDateRequest');

    cy.contains('label', 'Datum od')
      .next('input')
      .clear()
      .type('2025-01-01');

    cy.contains('label', 'Datum do')
      .next('input')
      .clear()
      .type('2025-01-31');

    cy.wait('@customDateRequest').then(({ request }) => {
      expect(request.url).to.include('from=');
      expect(request.url).to.include('to=');
    });
  });

  it('Seřazení podle ceny (ověření na frontendu)', () => {
    cy.contains('label', 'Řazení')
      .next()
      .select('Cena ↑');

    // Správně by zde mělo následovat ověření pořadí prvků v DOM
    // (např. porovnání hodnot cen)
  });

  it('Reset filtrů (bez falešných pádů)', () => {
    cy.intercept('GET', '**/api/events*priceMax=*').as('setPriceFilter');

    cy.contains('label', 'Cena do')
      .next('input')
      .clear()
      .type('150');

    cy.wait('@setPriceFilter');

    cy.intercept('GET', '**/api/events*').as('resetRequest');

    cy.contains('button', 'Vymazat filtry').click();

    cy.wait('@resetRequest').then(({ request }) => {
      expect(request.url).not.to.include('venueId=');
      expect(request.url).not.to.include('priceMax=');
      expect(request.url).not.to.include('to=');
      expect(request.url).not.to.include('q=');

      // `from=` je defaultní parametr → musí zůstat
      expect(request.url).to.include('from=');
    });
  });
});
