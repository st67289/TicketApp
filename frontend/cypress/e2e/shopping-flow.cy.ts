describe('Nákupní proces (User Flow)', () => {
  
  // Adresa, kde ti běží React (Frontend)
  const FRONTEND_URL = "http://localhost:5173";
  // Adresa, kam se posílají data (Backend)
  const BACKEND_URL = "http://localhost:8080";

  // Pomocná funkce pro vytvoření falešného JWT tokenu (role USER)
  const createFakeToken = () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: "user@test.cz", role: "USER", exp: 9999999999 }));
    return `${header}.${payload}.signature`;
  };

  beforeEach(() => {
    // 1. Nastavíme token přímo do prohlížeče (Simulujeme přihlášení)
    cy.window().then((win) => {
      win.localStorage.setItem("token", createFakeToken());
    });

    // 2. Mock ověření uživatele (/api/auth/me)
    cy.intercept('GET', `${BACKEND_URL}/api/auth/me`, {
      statusCode: 200,
      body: { email: "user@test.cz", role: "USER" }
    }).as('getMe');
  });

  // --- TEST 1: Dashboard -> Detail ---
  it('Dashboard: Kliknutí na událost přesměruje na detail', () => {
    // Mock dat pro dashboard
    cy.intercept('GET', `${BACKEND_URL}/api/dashboard/user`, {
      statusCode: 200,
      body: {
        upcomingEvents: [
          {
            id: 10,
            name: "Koncert Imagine Dragons",
            startTime: new Date().toISOString(),
            venue: { id: 1, name: "O2 Arena", address: "Praha" },
            hasStanding: true,
            hasSeating: false,
            fromPrice: 1500,
            available: 100,
            total: 1000
          }
        ],
        totalUpcomingCount: 1,
        cheapestTicketPrice: 1500
      }
    }).as('getDashboard');

    // Návštěva dashboardu
    cy.visit(`${FRONTEND_URL}/user`);
    cy.wait('@getDashboard');

    // Ověření, že se karta vykreslila
    cy.contains('Koncert Imagine Dragons').should('be.visible');

    // Kliknutí na tlačítko "Koupit"
    cy.contains('button', 'Koupit').click();

    // Ověření přesměrování URL
    cy.url().should('include', '/events/10');
  });

  // --- TEST 2: Nákup na stání (20 ks) ---
  it('Detail akce: Přidání 20 lístků na stání do košíku', () => {
    const eventId = 10;

    // 1. Mock detailu události
    cy.intercept('GET', `${BACKEND_URL}/api/events/${eventId}`, {
      statusCode: 200,
      body: {
        id: eventId,
        name: "Koncert Imagine Dragons",
        startTime: new Date().toISOString(),
        venue: { id: 1, name: "O2 Arena", address: "Praha" },
        standingPrice: 1500,
        description: "Super koncert."
      }
    }).as('getEvent');

    // 2. Mock přidání do košíku (POST)
    cy.intercept('POST', `${BACKEND_URL}/api/carts/items`, {
      statusCode: 200,
      body: { success: true }
    }).as('addToCart');

    // 3. Mock obsahu košíku (který se načte po přesměrování)
    cy.intercept('GET', `${BACKEND_URL}/api/carts/me`, {
      statusCode: 200,
      body: {
        id: 1,
        items: [
          {
            ticketId: 999,
            eventName: "Koncert Imagine Dragons",
            eventStartTime: new Date().toISOString(),
            venue: { id: 1, name: "O2 Arena" },
            price: 1500,
            status: "RESERVED"
          }
        ],
        itemsCount: 20,       // Simulujeme 20 kusů
        total: 30000          // 1500 * 20 = 30000
      }
    }).as('getCart');

    // Jdeme na detail akce
    cy.visit(`${FRONTEND_URL}/events/${eventId}`);
    cy.wait('@getEvent');

    cy.contains('Vstupenky na stání').should('be.visible');
    
    // Změna počtu lístků na 20 - použijeme {selectall} pro bezpečné přepsání
    cy.get('input[type="number"]').type('{selectall}20');
    
    // Kontrola, že je v inputu správná hodnota
    cy.get('input[type="number"]').should('have.value', '20');

    // Kliknutí na "Do košíku"
    cy.contains('button', 'Do košíku').click();

    // Čekání na API volání a kontrola
    cy.wait('@addToCart').its('request.body').should('deep.include', {
      eventId: eventId,
      quantity: 20
    });

    // Ověření přesměrování
    cy.url().should('include', '/cart');
    
    // Ověření, že se zobrazuje správná celková cena podle našeho mocku
    cy.contains('30000 Kč').should('be.visible');
    cy.contains('Celkem (20 ks)').should('be.visible');
  });


  // --- TEST 3: Nákup na sezení (Robustní verze) ---
  it('Detail akce: Výběr konkrétních míst na sezení', () => {
    const eventId = 20;
    const venueId = 5;

    // 1. Mock detailu - definujeme řadu "A"
    cy.intercept('GET', `${BACKEND_URL}/api/events/${eventId}`, {
      statusCode: 200,
      body: {
        id: eventId,
        name: "Divadlo Sklep",
        startTime: new Date().toISOString(),
        venue: { 
          id: venueId, 
          name: "Divadlo", 
          seatingPlanJson: JSON.stringify({ rows: [{ label: "A", count: 3 }] }) 
        },
        seatingPrice: 500
      }
    }).as('getEventSeating');

    // 2. Mock sedadel - definujeme sedadla 1, 2, 3
    cy.intercept('GET', `${BACKEND_URL}/api/venues/${venueId}/seats`, {
      statusCode: 200,
      body: [
        { id: 101, seatRow: "A", seatNumber: "1" },
        { id: 102, seatRow: "A", seatNumber: "2" },
        { id: 103, seatRow: "A", seatNumber: "3" }
      ]
    }).as('getSeats');

    // 3. Mock obsazených míst
    cy.intercept('GET', `${BACKEND_URL}/api/events/${eventId}/occupied-seats`, {
      statusCode: 200,
      body: [103]
    }).as('getOccupied');

    // 4. Mock přidání do košíku
    cy.intercept('POST', `${BACKEND_URL}/api/carts/items`, { statusCode: 200, body: { success: true } }).as('addToCart');

    // 5. Mock košíku - ZDE BYLA CHYBA
    // Musíme přidat seatId, jinak si CartPage myslí, že je to stání
    cy.intercept('GET', `${BACKEND_URL}/api/carts/me`, {
      statusCode: 200,
      body: {
        id: 1,
        items: [
            { 
              ticketId: 1, 
              eventName: "Divadlo", 
              venue: {name: "Divadlo"}, 
              seatRow: "A", 
              seatNumber: "1", 
              price: 500,
              seatId: 101  // <--- DŮLEŽITÉ: Přidáno seatId
            },
            { 
              ticketId: 2, 
              eventName: "Divadlo", 
              venue: {name: "Divadlo"}, 
              seatRow: "A", 
              seatNumber: "2", 
              price: 500,
              seatId: 102  // <--- DŮLEŽITÉ: Přidáno seatId
            }
        ],
        itemsCount: 2, total: 1000
      }
    }).as('getCart');

    // --- Start testu ---
    cy.visit(`${FRONTEND_URL}/events/${eventId}`);
    cy.wait(['@getEventSeating', '@getSeats', '@getOccupied']);

    cy.contains('PODIUM').should('be.visible');

    // 1. Klik na sedadlo 1
    cy.contains('div[class*="seat"]', /^1$/).click({ force: true });
    
    // 2. Klik na sedadlo 2
    cy.contains('div[class*="seat"]', /^2$/).click({ force: true });

    // 3. Odeslání
    cy.contains('button', 'Koupit 2 vybraná místa').should('be.visible').click();

    // 4. Kontrola API requestu
    cy.wait('@addToCart').its('request.body').should('deep.include', {
      eventId: eventId,
      seatIds: [101, 102]
    });

    // 5. Kontrola obsahu košíku
    cy.url().should('include', '/cart');
    // Teď už by se to mělo zobrazit, protože items mají seatId
    cy.contains('Řada A, Sedadlo 1').should('be.visible');
    cy.contains('Řada A, Sedadlo 2').should('be.visible');
  });
  
  // --- TEST 4: Odebrání z košíku ---
  it('Košík: Odebrání položky', () => {
    // 1. Mock košíku s 1 položkou
    cy.intercept('GET', `${BACKEND_URL}/api/carts/me`, {
      statusCode: 200,
      body: {
        id: 1,
        items: [
          {
            ticketId: 123,
            eventName: "Festival Rock",
            eventStartTime: new Date().toISOString(),
            venue: { id: 2, name: "Letiště" },
            price: 2000,
            status: "RESERVED"
          }
        ],
        itemsCount: 1,
        total: 2000
      }
    }).as('getCartFull');

    // 2. Mock smazání položky -> vrátí prázdný košík
    cy.intercept('DELETE', `${BACKEND_URL}/api/carts/items/123`, {
      statusCode: 200,
      body: {
        id: 1,
        items: [],
        itemsCount: 0,
        total: 0
      }
    }).as('deleteItem');

    cy.visit(`${FRONTEND_URL}/cart`);
    cy.wait('@getCartFull');

    cy.contains('Festival Rock').should('be.visible');

    // Kliknutí na odebrat (Cypress automaticky potvrdí alert)
    cy.contains('button', 'Odebrat').click();

    cy.wait('@deleteItem');

    // Ověření, že je košík prázdný
    cy.contains('Váš košík je prázdný').should('be.visible');
  });

});