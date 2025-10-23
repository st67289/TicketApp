
create table email_log (
                           id uuid not null,
                           body text,
                           error text,
                           sent_at timestamp(6) with time zone,
                           status varchar(16) not null check (status in ('QUEUED','SENT','FAILED')),
                           subject varchar(255) not null,
                           to_email text not null,
                           user_id uuid,
                           primary key (id)
);

create table event_seats (
                             id uuid not null,
                             currency char(3),
                             is_enabled boolean not null,
                             price_cents integer not null,
                             event_id uuid not null,
                             seat_id uuid not null,
                             primary key (id)
);

alter table if exists events
alter column currency set data type char(3)
;
create table order_items (
                             id uuid not null,
                             currency char(3),
                             item_kind varchar(16) not null check (item_kind in ('SEAT','STANDING')),
                             quantity integer not null,
                             unit_price_cents integer not null,
                             event_id uuid not null,
                             order_id uuid not null,
                             seat_id uuid,
                             primary key (id)
);

create table orders (
                        id uuid not null,
                        created_at timestamp(6) with time zone not null,
                        currency char(3),
                        paid_at timestamp(6) with time zone,
                        status varchar(16) not null check (status in ('CREATED','PAID','CANCELLED')),
                        total_cents integer not null,
                        user_id uuid not null,
                        primary key (id)
)
;
create table payments (
                          id uuid not null,
                          amount_cents integer not null,
                          created_at timestamp(6) with time zone not null,
                          currency char(3),
                          provider varchar(255) not null,
                          provider_txn_id varchar(255),
                          status varchar(16) not null check (status in ('PENDING','SUCCEEDED','FAILED')),
                          order_id uuid not null,
                          primary key (id)
);

create table reservations (
                              id uuid not null,
                              active boolean not null,
                              created_at timestamp(6) with time zone not null,
                              expires_at timestamp(6) with time zone,
                              standing_qty integer,
                              event_id uuid not null,
                              seat_id uuid,
                              user_id uuid not null,
                              primary key (id)
;

create index ix_email_log_user
    on email_log (user_id)
;
create index ix_event_seats_event
    on event_seats (event_id)
;
create index ix_event_seats_seat
    on event_seats (seat_id)
;
alter table if exists event_seats
drop constraint if exists ux_event_seats_event_seat
;
alter table if exists event_seats
    add constraint ux_event_seats_event_seat unique (event_id, seat_id)
;
create index ix_order_items_order
    on order_items (order_id)
;
create index ix_order_items_event
    on order_items (event_id)
;
create index ix_order_items_seat
    on order_items (seat_id)
;
create index ix_orders_user
    on orders (user_id)
;
create index ix_payments_order
    on payments (order_id)
;
create index ix_reservations_user
    on reservations (user_id)
;
create index ix_reservations_event
    on reservations (event_id)
;
create index ix_reservations_seat
    on reservations (seat_id)
;
alter table if exists email_log
    add constraint fk_email_log_user
    foreign key (user_id)
    references users
;
alter table if exists event_seats
    add constraint fk_event_seats_event
    foreign key (event_id)
    references events
;
alter table if exists event_seats
    add constraint fk_event_seats_seat
    foreign key (seat_id)
    references seats
;
alter table if exists order_items
    add constraint fk_order_items_event
    foreign key (event_id)
    references events
;
alter table if exists order_items
    add constraint fk_order_items_order
    foreign key (order_id)
    references orders
;
alter table if exists order_items
    add constraint fk_order_items_seat
    foreign key (seat_id)
    references seats
;
alter table if exists orders
    add constraint fk_orders_user
    foreign key (user_id)
    references users
;
alter table if exists payments
    add constraint fk_payments_order
    foreign key (order_id)
    references orders
;
alter table if exists reservations
    add constraint fk_reservations_event
    foreign key (event_id)
    references events
;
alter table if exists reservations
    add constraint fk_reservations_seat
    foreign key (seat_id)
    references seats
;
alter table if exists reservations
    add constraint fk_reservations_user
    foreign key (user_id)
    references users
;