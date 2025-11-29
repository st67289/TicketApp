alter table if exists tickets
    add constraint uk_ticket_event_seat unique (event_id, seat_id);

alter table if exists tickets drop column ticket_type;