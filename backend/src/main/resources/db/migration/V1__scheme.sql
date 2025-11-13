-- ===========================================
-- V1__schema.sql  (PostgreSQL)
-- Schéma pro: users, venues, carts, seats, events, orders, tickets
-- Enumy jsou mapované jako VARCHAR (EnumType.STRING)
-- ===========================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
                                     user_id         BIGSERIAL PRIMARY KEY,
                                     first_name      VARCHAR(255),
    second_name     VARCHAR(255),
    birth_date      DATE,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255),
    role            VARCHAR(32)  NOT NULL,   -- cz.upce.fei.TicketApp.model.enums.UserRoles
    oauth_provider  VARCHAR(255),
    oauth_id        VARCHAR(255),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

-- unikátní email
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email);

-- VENUES
CREATE TABLE IF NOT EXISTS venues (
                                      venue_id            BIGSERIAL PRIMARY KEY,
                                      name                VARCHAR(255) NOT NULL,
    address             VARCHAR(255),
    standing_capacity   INTEGER,
    sitting_capacity    INTEGER,
    seating_plan_json   TEXT
    );

-- CARTS (1:1 k users)
CREATE TABLE IF NOT EXISTS carts (
                                     cart_id       BIGSERIAL PRIMARY KEY,
                                     user_id       BIGINT NOT NULL,
                                     last_changed  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

-- 1 košík na uživatele
CREATE UNIQUE INDEX IF NOT EXISTS ux_cart_user ON carts(user_id);
CREATE INDEX IF NOT EXISTS ix_cart_user ON carts(user_id);

-- SEATS
CREATE TABLE IF NOT EXISTS seats (
                                     seat_id     BIGSERIAL PRIMARY KEY,
                                     venue_id    BIGINT NOT NULL,
                                     seat_row    VARCHAR(255),
    seat_number VARCHAR(255),
    seat_type   VARCHAR(255),
    CONSTRAINT fk_seat_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
    );

-- jedinečnost sedadla v rámci venue
CREATE UNIQUE INDEX IF NOT EXISTS ux_seat_venue_row_number
    ON seats(venue_id, seat_row, seat_number);

CREATE INDEX IF NOT EXISTS ix_seats_venue ON seats(venue_id);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
                                      event_id        BIGSERIAL PRIMARY KEY,
                                      name            VARCHAR(255) NOT NULL,
    description     TEXT,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ,
    standing_price  NUMERIC(10,2),
    seating_price   NUMERIC(10,2),
    venue_id        BIGINT NOT NULL,
    CONSTRAINT fk_event_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
    );

CREATE INDEX IF NOT EXISTS ix_events_venue ON events(venue_id);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
                                      order_id        BIGSERIAL PRIMARY KEY,
                                      user_id         BIGINT NOT NULL,
                                      total_price     NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_status  VARCHAR(32),  -- cz.upce.fei.TicketApp.model.enums.OrderStatus
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

CREATE INDEX IF NOT EXISTS ix_order_user ON orders(user_id);

-- TICKETS
CREATE TABLE IF NOT EXISTS tickets (
                                       ticket_id    BIGSERIAL PRIMARY KEY,
                                       event_id     BIGINT NOT NULL,
                                       seat_id      BIGINT,
                                       ticket_type  VARCHAR(16),     -- cz.upce.fei.TicketApp.model.enums.TicketType
    cart_id      BIGINT,
    order_id     BIGINT,
    ticket_code  VARCHAR(255) NOT NULL,
    price        NUMERIC(10,2) NOT NULL,
    status       VARCHAR(32) NOT NULL,  -- cz.upce.fei.TicketApp.model.enums.TicketStatus
    CONSTRAINT fk_ticket_event FOREIGN KEY (event_id) REFERENCES events(event_id),
    CONSTRAINT fk_ticket_seat  FOREIGN KEY (seat_id)  REFERENCES seats(seat_id),
    CONSTRAINT fk_ticket_cart  FOREIGN KEY (cart_id)  REFERENCES carts(cart_id),
    CONSTRAINT fk_ticket_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );

-- indexy a unikáty pro tickets
CREATE UNIQUE INDEX IF NOT EXISTS ux_ticket_code ON tickets(ticket_code);
CREATE INDEX IF NOT EXISTS ix_ticket_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS ix_ticket_seat  ON tickets(seat_id);
CREATE INDEX IF NOT EXISTS ix_ticket_cart  ON tickets(cart_id);
CREATE INDEX IF NOT EXISTS ix_ticket_order ON tickets(order_id);
