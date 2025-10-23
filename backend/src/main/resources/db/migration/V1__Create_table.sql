
create table events (
                        id uuid not null,
                        currency char(3),
                        description text,
                        end_at timestamp(6) with time zone not null,
                        hall_id uuid not null,
                        published boolean not null,
                        seating text,
                        standing_capacity integer,
                        standing_price_cents integer,
                        standing_sold integer,
                        start_at timestamp(6) with time zone not null,
                        title varchar(255) not null,
                        primary key (id)
);

create table seats (
                       id uuid not null,
                       hall_id uuid not null,
                       row_label varchar(255),
                       seat_number varchar(255),
                       section varchar(255),
                       primary key (id)
);

create table test (
                      id bigint not null,
                      primary key (id)
);

create table tickets (
                         id uuid not null,
                         issued_at timestamp(6) with time zone,
                         qr_payload text,
                         status varchar(32) not null check (status in ('ISSUED','USED','REFUNDED')),
                         ticket_code varchar(255),
                         event_id uuid not null,
                         seat_id uuid,
                         user_id uuid not null,
                         primary key (id)
);

create table users (
                       id uuid not null,
                       blocked boolean not null,
                       created_at timestamp(6) with time zone not null,
                       email text not null,
                       first_name varchar(255),
                       last_name varchar(255),
                       password_hash varchar(255) not null,
                       role varchar(32) not null check (role in ('ADMINISTRATOR','USER')),
                       primary key (id)
);

create index ix_seats_hall
    on seats (hall_id)
;
create index ix_tickets_user
    on tickets (user_id)
;
create index ix_tickets_event
    on tickets (event_id)
;
create index ix_tickets_seat
    on tickets (seat_id)
;
alter table if exists users
drop constraint if exists ux_users_email
;
alter table if exists users
    add constraint ux_users_email unique (email)
;
alter table if exists tickets
    add constraint fk_tickets_event
    foreign key (event_id)
    references events
;
alter table if exists tickets
    add constraint fk_tickets_seat
    foreign key (seat_id)
    references seats
;
alter table if exists tickets
    add constraint fk_tickets_user
    foreign key (user_id)
    references users
;