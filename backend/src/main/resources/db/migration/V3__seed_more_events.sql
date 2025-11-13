-- ========== RESET ==========
-- Bezpečně vymažeme data v pořadí kvůli FK
TRUNCATE TABLE tickets, orders, carts, events, seats, venues, users RESTART IDENTITY CASCADE;

-- ========== USERS ==========
-- POZN: password_hash MUSÍ být BCrypt!
INSERT INTO users (first_name, second_name, birth_date, email, password_hash, role, oauth_provider, oauth_id)
VALUES
    ('Admin', 'User',  '1990-01-01', 'admin@example.com',  'REPLACE_WITH_BCRYPT_HESLO123', 'ADMINISTRATOR', NULL, NULL),
    ('Jan',   'Novák', '2000-01-01', 'user@example.com',   'REPLACE_WITH_BCRYPT_HESLO123', 'USER',          NULL, NULL);

-- (volitelné) košíky
INSERT INTO carts (user_id, last_changed) VALUES (1, NOW()), (2, NOW());

-- ========== VENUES ==========
-- Přidáme více míst, různé kapacity (jen stání / jen sezení / obojí)
INSERT INTO venues (name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES
    -- id 1..8
    ('O2 arena',             'Praha 9',                5000, 2000, NULL),   -- id 1
    ('Divadlo Pod Lampou',   'Plzeň centrum',           300,  120, NULL),   -- id 2
    ('Forum Karlín',         'Praha 8',                1200,  800, NULL),   -- id 3
    ('Roxy',                 'Praha 1',                 900,   50, NULL),   -- id 4 (téměř jen stání)
    ('Sono Centrum',         'Brno-střed',              600,  600, NULL),   -- id 5
    ('GONG Dolní Vítkovice', 'Ostrava',                1500,    0, NULL),   -- id 6 (jen stání)
    ('KD Hronovická',        'Pardubice',                 0,  450, NULL),   -- id 7 (jen sezení)
    ('DK Metropol',          'České Budějovice',        200,  700, NULL);   -- id 8

-- ========== SEATS (ukázkové, ať je v DB něco i pro sedadla) ==========
-- Pro jednoduchost: pár míst u některých venue (není nutné pro kapacity, ty bereš z venues)
INSERT INTO seats (venue_id, seat_row, seat_number, seat_type) VALUES
                                                                   -- O2 arena (řada A: 1..10)
                                                                   (1, 'A', '1',  'STANDARD'), (1, 'A', '2',  'STANDARD'), (1, 'A', '3',  'STANDARD'),
                                                                   (1, 'A', '4',  'STANDARD'), (1, 'A', '5',  'STANDARD'), (1, 'A', '6',  'STANDARD'),
                                                                   (1, 'A', '7',  'STANDARD'), (1, 'A', '8',  'STANDARD'), (1, 'A', '9',  'STANDARD'),
                                                                   (1, 'A', '10', 'STANDARD'),

                                                                   -- Divadlo Pod Lampou (B 1..5, C 1..5)
                                                                   (2, 'B', '1', 'STANDARD'), (2, 'B', '2', 'STANDARD'), (2, 'B', '3', 'STANDARD'),
                                                                   (2, 'B', '4', 'STANDARD'), (2, 'B', '5', 'STANDARD'),
                                                                   (2, 'C', '1', 'STANDARD'), (2, 'C', '2', 'STANDARD'), (2, 'C', '3', 'STANDARD'),
                                                                   (2, 'C', '4', 'STANDARD'), (2, 'C', '5', 'STANDARD'),

                                                                   -- Forum Karlín (D 1..5)
                                                                   (3, 'D', '1', 'STANDARD'), (3, 'D', '2', 'STANDARD'), (3, 'D', '3', 'STANDARD'),
                                                                   (3, 'D', '4', 'STANDARD'), (3, 'D', '5', 'STANDARD'),

                                                                   -- KD Hronovická (E 1..5) – jen sezení ve venue
                                                                   (7, 'E', '1', 'STANDARD'), (7, 'E', '2', 'STANDARD'), (7, 'E', '3', 'STANDARD'),
                                                                   (7, 'E', '4', 'STANDARD'), (7, 'E', '5', 'STANDARD');

-- ========== EVENTS ==========
-- Mix akcí: různé venues, ceny, datumy, jen sezení/jen stání/oboje
-- Dbej na ISO s offsetem +01:00 (zimní čas); klidně měň dle potřeby
INSERT INTO events (name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES
    -- O2 arena – obojí
    ('Imagine Dragons', 'Koncert roku', '2025-12-20T19:00:00+01:00', '2025-12-20T22:00:00+01:00', 990.00, 1490.00, 1),
    ('Metallica Tribute', 'Pocta legendě', '2026-02-10T20:00:00+01:00', '2026-02-10T23:00:00+01:00', 790.00, 1290.00, 1),

    -- Divadlo Pod Lampou – spíš sezení
    ('Shakespeare Night', 'Divadelní představení pod lampou', '2026-01-15T19:30:00+01:00', '2026-01-15T21:45:00+01:00', NULL, 390.00, 2),
    ('Stand-up Pod Lampou', 'Večer s komiky', '2025-12-05T20:00:00+01:00', '2025-12-05T22:00:00+01:00', NULL, 320.00, 2),

    -- Forum Karlín – obojí
    ('Jazz & Wine', 'Jazzový večer se sklenkou', '2026-03-22T19:00:00+01:00', '2026-03-22T21:30:00+01:00', 450.00, 690.00, 3),
    ('Symphonic Game Music', 'Orchestr herní hudby', '2026-04-10T18:30:00+01:00', '2026-04-10T21:30:00+01:00', 690.00, 990.00, 3),

    -- Roxy – skoro jen stání
    ('Drum & Bass Night', 'Celonoční DnB mejdan', '2026-01-28T22:00:00+01:00', '2026-01-29T04:00:00+01:00', 490.00, NULL, 4),
    ('Indie Friday', 'Indie kapely a DJs', '2026-02-14T21:00:00+01:00', '2026-02-15T02:00:00+01:00', 350.00, NULL, 4),

    -- Sono Centrum – obojí
    ('Film Music Live', 'Známé filmové melodie', '2026-03-02T19:00:00+01:00', '2026-03-02T21:15:00+01:00', 490.00, 790.00, 5),
    ('Acoustic Evening', 'Intimní akustický koncert', '2026-01-19T19:30:00+01:00', '2026-01-19T21:30:00+01:00', 350.00, 590.00, 5),

    -- GONG (Ostrava) – jen stání ve venue
    ('Techno Warehouse', 'Techno v industriálním prostoru', '2026-02-07T22:00:00+01:00', '2026-02-08T06:00:00+01:00', 420.00, NULL, 6),
    ('Retro 80s Party', 'Vrať se do osmdesátek', '2026-04-04T20:00:00+02:00', '2026-04-05T02:00:00+02:00', 390.00, NULL, 6),

    -- KD Hronovická (Pardubice) – jen sezení ve venue
    ('Klasický koncert', 'Smyčcové kvarteto', '2026-02-20T18:00:00+01:00', '2026-02-20T20:00:00+01:00', NULL, 350.00, 7),
    ('Talk Show Live', 'Hosté a diskuze', '2026-03-12T19:00:00+01:00', '2026-03-12T21:00:00+01:00', NULL, 290.00, 7),

    -- DK Metropol (ČB) – obojí
    ('Baletní gala', 'Výběr z klasických baletů', '2026-01-30T19:00:00+01:00', '2026-01-30T21:30:00+01:00', NULL, 650.00, 8),
    ('Rockový večírek', 'Lokální rockové kapely', '2026-03-15T19:30:00+01:00', '2026-03-15T23:00:00+01:00', 350.00, 520.00, 8);

-- ========== (volitelné) DEMO TICKETS ==========
-- Ať je co vidět ve výpisech (oba RESERVED v košíku usera id=2)
-- POZOR: ticket_code musí být unikátní
INSERT INTO tickets (event_id, seat_id, ticket_type, cart_id, order_id, ticket_code, price, status)
VALUES
    (1, 1,   'SEATING', 2, NULL, 'E1-SEAT-A1-DEMO', 1490.00, 'RESERVED'),
    (1, NULL,'STANDING', 2, NULL, 'E1-STAND-0001',   990.00, 'RESERVED');

-- Hotovo.
