-- Dev seed: venues, seats, events, users (+ volitelně carts)
-- Bezpečně vymažeme data v pořadí kvůli FK
TRUNCATE TABLE tickets, orders, carts, events, seats, venues, users RESTART IDENTITY CASCADE;

-- ========== USERS ==========
-- POZN: password_hash MUSÍ být BCrypt! Viz poznámky níže.
INSERT INTO users (first_name, second_name, birth_date, email, password_hash, role, oauth_provider, oauth_id)
VALUES
    ('Admin', 'User',  '1990-01-01', 'admin@example.com',  'REPLACE_WITH_BCRYPT_HESLO123', 'ADMINISTRATOR', NULL, NULL),
    ('Jan',   'Novák', '2000-01-01', 'user@example.com',   'REPLACE_WITH_BCRYPT_HESLO123', 'USER',          NULL, NULL);

-- (volitelné) předvytvoření košíků pro oba – není nutné; app si je může založit sama
INSERT INTO carts (user_id, last_changed) VALUES (1, NOW()), (2, NOW());

-- ========== VENUES ==========
INSERT INTO venues (name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES
    ('O2 arena',           'Praha 9',       5000, 2000, NULL),   -- id 1
    ('Divadlo Pod Lampou', 'Plzeň centrum',  300,  120, NULL);   -- id 2

-- ========== SEATS ==========
-- O2 arena: řada A, 10 míst
INSERT INTO seats (venue_id, seat_row, seat_number, seat_type) VALUES
                                                                   (1, 'A', '1', 'STANDARD'),
                                                                   (1, 'A', '2', 'STANDARD'),
                                                                   (1, 'A', '3', 'STANDARD'),
                                                                   (1, 'A', '4', 'STANDARD'),
                                                                   (1, 'A', '5', 'STANDARD'),
                                                                   (1, 'A', '6', 'STANDARD'),
                                                                   (1, 'A', '7', 'STANDARD'),
                                                                   (1, 'A', '8', 'STANDARD'),
                                                                   (1, 'A', '9', 'STANDARD'),
                                                                   (1, 'A', '10','STANDARD');

-- Divadlo: řady B (1–5) a C (1–5)
INSERT INTO seats (venue_id, seat_row, seat_number, seat_type) VALUES
                                                                   (2, 'B', '1', 'STANDARD'), (2, 'B', '2', 'STANDARD'), (2, 'B', '3', 'STANDARD'), (2, 'B', '4', 'STANDARD'), (2, 'B', '5', 'STANDARD'),
                                                                   (2, 'C', '1', 'STANDARD'), (2, 'C', '2', 'STANDARD'), (2, 'C', '3', 'STANDARD'), (2, 'C', '4', 'STANDARD'), (2, 'C', '5', 'STANDARD');

-- ========== EVENTS ==========
-- Koncert (má sezení i stání)
INSERT INTO events (name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES
    ('Imagine Dragons', 'Koncert roku',  '2025-12-20T19:00:00+01:00', '2025-12-20T22:00:00+01:00', 990.00, 1490.00, 1),
    ('Shakespeare Night', 'Divadelní představení pod lampou', '2026-01-15T19:30:00+01:00', '2026-01-15T21:45:00+01:00', NULL, 390.00, 2);

-- ========== (volitelně) DEMO TICKETS ==========
-- Jen ať máš v DB něco vidět ve výpisech (oba RESERVED v košíku usera id=2)
-- Pozor: ticket_code má být unikátní; pro demo použijeme pevné řetězce.
INSERT INTO tickets (event_id, seat_id, ticket_type, cart_id, order_id, ticket_code, price, status)
VALUES
    (1, 1, 'SEATING', 2, NULL, 'E1-SEAT-A1-DEMO', 1490.00, 'RESERVED'),
    (1, NULL, 'STANDING', 2, NULL, 'E1-STAND-0001', 990.00, 'RESERVED');

-- Hotovo.
