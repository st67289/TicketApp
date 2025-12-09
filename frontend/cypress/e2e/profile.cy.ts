describe('Uživatelský profil a nastavení', () => {

  const FRONTEND_URL = "http://localhost:5173";
  const BACKEND_URL = "http://localhost:8080";

  // Helper pro vytvoření tokenu (aby nás pustil PrivateRoute)
  const createFakeToken = () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: "user@test.cz", role: "USER", exp: 9999999999 }));
    return `${header}.${payload}.signature`;
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("token", createFakeToken());
    });

    // Mock ověření uživatele (aby App.tsx věděl, že jsme USER)
    cy.intercept('GET', `${BACKEND_URL}/api/auth/me`, {
      statusCode: 200,
      body: { email: "jan.novak@example.com", role: "USER" }
    }).as('getMe');
  });

  it('Načtení profilu, změna jména a uložení', () => {
    // 1. Mock načtení dat profilu (GET)
    // Vrátíme nějaká výchozí data
    cy.intercept('GET', `${BACKEND_URL}/api/user/me`, {
      statusCode: 200,
      body: {
        firstName: "Jan",
        secondName: "Novák",
        birthDate: "1990-05-15",
        email: "jan.novak@example.com",
        role: "USER",
        createdAt: "2023-01-01T12:00:00" // Datum registrace pro výpočet dní
      }
    }).as('getUserData');

    // 2. Mock uložení změn (PUT)
    // Backend obvykle nevrací nic nebo aktualizovaný objekt, stačí 200 OK
    cy.intercept('PUT', `${BACKEND_URL}/api/user/me`, {
      statusCode: 200,
      body: {}
    }).as('updateUser');

    // Návštěva stránky profilu (podle App.tsx je to /user/account)
    cy.visit(`${FRONTEND_URL}/user/account`);

    // Počkáme na načtení dat
    cy.wait('@getUserData');

    // --- KONTROLA VÝCHOZÍHO STAVU ---
    
    // Ověříme, že se načetlo jméno "Jan"
    // Hledáme Label "Jméno" a hned za ním Input (protože v HTML jsou sourozenci)
    cy.contains('label', 'Jméno').next('input').should('have.value', 'Jan');
    
    // Ověříme příjmení
    cy.contains('label', 'Příjmení').next('input').should('have.value', 'Novák');

    // Ověříme, že Email je disabled
    cy.contains('label', 'Email').next('input')
      .should('have.value', 'jan.novak@example.com')
      .should('be.disabled');

    // Ověříme výpočet dní (jen zda se text zobrazuje)
    cy.contains('Jsi s námi už').should('be.visible');

    // --- ÚPRAVA DAT ---

    // Změníme jméno z "Jan" na "Petr"
    // {selectall} vybere celý text a přepíše ho (bezpečnější než clear)
    cy.contains('label', 'Jméno').next('input')
      .type('{selectall}Petr');

    // Změníme příjmení na "Svoboda"
    cy.contains('label', 'Příjmení').next('input')
      .type('{selectall}Svoboda');

    // --- ULOŽENÍ ---

    // Klikneme na tlačítko Uložit
    cy.contains('button', 'Uložit změny').click();

    // --- OVĚŘENÍ ODESLÁNÍ ---

    // Počkáme na PUT request a zkontrolujeme, co přesně odešlo na backend
    cy.wait('@updateUser').its('request.body').should('deep.include', {
      firstName: "Petr",
      secondName: "Svoboda",
      birthDate: "1990-05-15" // Datum jsme neměnili, mělo by zůstat stejné
    });

    // Ověříme, že se zobrazila hláška o úspěchu
    cy.contains('Uloženo ✔').should('be.visible');
  });

  it('Zobrazení chyby při selhání ukládání', () => {
    // Mock GET (musíme načíst data, aby bylo co ukládat)
    cy.intercept('GET', `${BACKEND_URL}/api/user/me`, {
      statusCode: 200,
      body: {
        firstName: "Test",
        secondName: "User",
        birthDate: "2000-01-01",
        email: "fail@test.com",
        role: "USER",
        createdAt: "2024-01-01T00:00:00"
      }
    }).as('getUserData');

    // Mock PUT s chybou (např. 500 Server Error)
    cy.intercept('PUT', `${BACKEND_URL}/api/user/me`, {
      statusCode: 500,
      body: { message: "Internal Server Error" }
    }).as('updateUserFail');

    cy.visit(`${FRONTEND_URL}/user/account`);
    cy.wait('@getUserData');

    // Zkusíme něco změnit
    cy.contains('label', 'Jméno').next('input').type('{selectall}Fail');

    // Uložit
    cy.contains('button', 'Uložit změny').click();

    // Čekáme na fail request
    cy.wait('@updateUserFail');

    // Ověříme, že se NEzobrazilo "Uloženo", ale chybová hláška
    cy.contains('Uloženo ✔').should('not.exist');
    // Protože v kódu máš "throw new Error("Nepodařilo se uložit")" pokud res.ok je false:
    cy.contains('Nepodařilo se uložit').should('be.visible');
  });

});