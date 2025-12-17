TRUNCATE TABLE
    public.tickets,
  public.orders,
  public.carts,
  public.seats,
  public.events,
  public.users,
  public.venues
RESTART IDENTITY CASCADE;

-- users
INSERT INTO public.users (user_id, first_name, second_name, birth_date, email, password_hash, role, oauth_provider, oauth_id, created_at, is_enabled)
VALUES (1, 'Adam', 'Dvořák', '2000-01-01', 'admin@email.com', '$2a$10$moqhEgZMu3j5Rsr3ddcZBuDh0ETJWrbJHFzDBcKKanSGctlyy82fq', 'ADMINISTRATOR', NULL, NULL, '2025-12-17 11:59:48.217619+00', true);

INSERT INTO public.users (user_id, first_name, second_name, birth_date, email, password_hash, role, oauth_provider, oauth_id, created_at, is_enabled)
VALUES (2, 'Jan', 'Chvojka', '2001-10-10', 'user@email.com', '$2a$10$z6lr61CbRrLfASoddIwEC.tALQkzQjm747Fi8/.11yRYmJqVi.cv.', 'USER', NULL, NULL, '2025-12-17 15:37:35.674309+00', true);

-- carts
INSERT INTO public.carts (cart_id, user_id, last_changed)
VALUES (1, 2, '2025-12-17 15:38:35.597078+00');

-- venues
INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (1, 'O2 Arena', 'Českomoravská 2345/17, 190 00 Praha 9', 500, 100, '{"rows":[{"label":"A","count":5},{"label":"B","count":5},{"label":"C","count":8},{"label":"D","count":8},{"label":"E","count":10},{"label":"F","count":10},{"label":"G","count":10},{"label":"H","count":14},{"label":"I","count":14},{"label":"J","count":16}]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (2, 'O2 universum', 'Českomoravská 2345/17, 190 00 Praha 9', 2000, 0, '{"rows":[]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (3, 'Lucerna Music Bar', 'Vodičkova 36, 110 00 Praha 1', 100, 45, '{"rows":[{"label":"A","count":5},{"label":"B","count":10},{"label":"C","count":10},{"label":"D","count":10},{"label":"E","count":10}]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (4, 'Divadlo Hybernia', 'náměstí Republiky 3/4, 110 00 Praha 1', 0, 165, '{"rows":[{"label":"A","count":15},{"label":"B","count":15},{"label":"C","count":15},{"label":"D","count":15},{"label":"E","count":15},{"label":"F","count":15},{"label":"G","count":15},{"label":"H","count":15},{"label":"I","count":15},{"label":"J","count":15},{"label":"K","count":15}]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (5, 'ROXY Prague', 'Dlouhá 33, 110 00 Praha 1', 500, 0, '{"rows":[]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (6, 'MeetFactory', 'Ke Sklárně 3213/15, 150 00 Praha 5', 400, 12, '{"rows":[{"label":"A","count":4},{"label":"B","count":4},{"label":"C","count":4}]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (7, 'SaSaZu — Club', 'Bubenské nábřeží 306, 170 00 Praha 7', 300, 0, '{"rows":[]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (8, 'Sportovní hala FORTUNA', 'Za Elektrárnou 419/1, 170 00 Praha', 2500, 140, '{"rows":[{"label":"A","count":10},{"label":"B","count":10},{"label":"C","count":10},{"label":"D","count":10},{"label":"E","count":10},{"label":"F","count":10},{"label":"G","count":10},{"label":"H","count":10},{"label":"I","count":10},{"label":"J","count":10},{"label":"K","count":10},{"label":"L","count":10},{"label":"M","count":10},{"label":"N","count":10}]}');

INSERT INTO public.venues (venue_id, name, address, standing_capacity, sitting_capacity, seating_plan_json)
VALUES (9, 'Sono Centrum', 'Veveří 113, 616 00 Brno', 80, 110, '{"rows":[{"label":"A","count":10},{"label":"B","count":10},{"label":"C","count":18},{"label":"D","count":18},{"label":"E","count":18},{"label":"F","count":18},{"label":"G","count":18}]}');

-- events
INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (1, 'Arena Pop Festival 2026', 'Velká popová show s několika interprety a plnou produkcí na aréně.', '2026-03-21 18:00:00+00', NULL, 1290.00, 2290.00, 1);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (2, 'Champions on Ice Show', 'Lední gala s choreografiemi, světelnou show a hosty z mezinárodní scény.', '2026-12-09 17:30:00+00', NULL, 1190.00, 2490.00, 1);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (3, 'Symphonic Rock Night', 'Spojení rockové kapely a orchestru – největší hity v symfonickém aranžmá.', '2026-05-12 18:00:00+00', NULL, 1390.00, 2690.00, 1);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (4, 'Tech & Future Expo Day', 'Denní expo s přednáškami, stánky partnerů a demo zónami technologií.', '2026-01-31 09:00:00+00', '2026-01-31 18:00:00+00', 490.00, NULL, 2);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (5, 'Comedy Gala: Big Laugh Night', 'Stand-up lineup večer, nejlepší sety + speciální host na závěr.', '2025-12-28 18:00:00+00', '2025-12-28 22:30:00+00', 690.00, NULL, 2);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (6, 'Esports Masters Prague', 'Finálový den turnaje s komentářem na pódiu, fan zónou a merch stánky.', '2026-01-14 15:00:00+00', NULL, 790.00, NULL, 2);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (7, 'Muzikál: Noční Praha', 'Autorský muzikál s živou kapelou, příběh z pražské noci a taneční čísla.', '2026-06-03 17:00:00+00', '2026-06-03 20:30:00+00', NULL, 890.00, 4);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (8, 'Stand-up Special: Hybernia Night', 'Tematický stand-up večer, crowd-work a speciální “late show” závěr.', '2025-12-25 18:00:00+00', '2025-12-25 21:00:00+00', NULL, 1190.00, 4);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (9, 'Roxy Club Night: House Edition', 'House night s rezidenty, dlouhé sety a důraz na groove a vokály.', '2025-12-30 19:30:00+00', '2025-12-31 03:00:00+00', 420.00, NULL, 5);

INSERT INTO public.events (event_id, name, description, start_time, end_time, standing_price, seating_price, venue_id)
VALUES (10, 'Art & Beats Showcase', 'Kombinace hudby a vizuálního umění, krátké live sety a výstava v areálu.', '2026-02-12 19:00:00+00', NULL, 390.00, 590.00, 6);

-- orders
INSERT INTO public.orders (order_id, user_id, total_price, created_at, payment_status)
VALUES (1, 2, 2380.00, '2025-12-17 15:38:01.617552+00', 'PAID');

INSERT INTO public.orders (order_id, user_id, total_price, created_at, payment_status)
VALUES (2, 2, 3160.00, '2025-12-17 15:38:35.54128+00', 'PAID');

-- seats
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (1, 1, 'A', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (2, 1, 'A', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (3, 1, 'A', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (4, 1, 'A', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (5, 1, 'A', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (6, 1, 'B', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (7, 1, 'B', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (8, 1, 'B', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (9, 1, 'B', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (10, 1, 'B', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (11, 1, 'C', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (12, 1, 'C', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (13, 1, 'C', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (14, 1, 'C', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (15, 1, 'C', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (16, 1, 'C', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (17, 1, 'C', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (18, 1, 'C', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (19, 1, 'D', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (20, 1, 'D', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (21, 1, 'D', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (22, 1, 'D', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (23, 1, 'D', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (24, 1, 'D', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (25, 1, 'D', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (26, 1, 'D', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (27, 1, 'E', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (28, 1, 'E', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (29, 1, 'E', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (30, 1, 'E', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (31, 1, 'E', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (32, 1, 'E', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (33, 1, 'E', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (34, 1, 'E', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (35, 1, 'E', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (36, 1, 'E', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (37, 1, 'F', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (38, 1, 'F', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (39, 1, 'F', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (40, 1, 'F', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (41, 1, 'F', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (42, 1, 'F', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (43, 1, 'F', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (44, 1, 'F', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (45, 1, 'F', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (46, 1, 'F', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (47, 1, 'G', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (48, 1, 'G', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (49, 1, 'G', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (50, 1, 'G', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (51, 1, 'G', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (52, 1, 'G', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (53, 1, 'G', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (54, 1, 'G', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (55, 1, 'G', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (56, 1, 'G', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (57, 1, 'H', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (58, 1, 'H', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (59, 1, 'H', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (60, 1, 'H', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (61, 1, 'H', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (62, 1, 'H', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (63, 1, 'H', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (64, 1, 'H', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (65, 1, 'H', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (66, 1, 'H', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (67, 1, 'H', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (68, 1, 'H', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (69, 1, 'H', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (70, 1, 'H', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (71, 1, 'I', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (72, 1, 'I', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (73, 1, 'I', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (74, 1, 'I', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (75, 1, 'I', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (76, 1, 'I', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (77, 1, 'I', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (78, 1, 'I', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (79, 1, 'I', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (80, 1, 'I', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (81, 1, 'I', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (82, 1, 'I', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (83, 1, 'I', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (84, 1, 'I', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (85, 1, 'J', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (86, 1, 'J', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (87, 1, 'J', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (88, 1, 'J', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (89, 1, 'J', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (90, 1, 'J', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (91, 1, 'J', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (92, 1, 'J', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (93, 1, 'J', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (94, 1, 'J', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (95, 1, 'J', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (96, 1, 'J', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (97, 1, 'J', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (98, 1, 'J', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (99, 1, 'J', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (100, 1, 'J', '16', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (101, 3, 'A', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (102, 3, 'A', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (103, 3, 'A', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (104, 3, 'A', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (105, 3, 'A', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (106, 3, 'B', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (107, 3, 'B', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (108, 3, 'B', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (109, 3, 'B', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (110, 3, 'B', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (111, 3, 'B', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (112, 3, 'B', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (113, 3, 'B', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (114, 3, 'B', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (115, 3, 'B', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (116, 3, 'C', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (117, 3, 'C', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (118, 3, 'C', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (119, 3, 'C', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (120, 3, 'C', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (121, 3, 'C', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (122, 3, 'C', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (123, 3, 'C', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (124, 3, 'C', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (125, 3, 'C', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (126, 3, 'D', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (127, 3, 'D', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (128, 3, 'D', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (129, 3, 'D', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (130, 3, 'D', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (131, 3, 'D', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (132, 3, 'D', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (133, 3, 'D', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (134, 3, 'D', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (135, 3, 'D', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (136, 3, 'E', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (137, 3, 'E', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (138, 3, 'E', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (139, 3, 'E', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (140, 3, 'E', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (141, 3, 'E', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (142, 3, 'E', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (143, 3, 'E', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (144, 3, 'E', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (145, 3, 'E', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (146, 4, 'A', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (147, 4, 'A', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (148, 4, 'A', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (149, 4, 'A', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (150, 4, 'A', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (151, 4, 'A', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (152, 4, 'A', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (153, 4, 'A', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (154, 4, 'A', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (155, 4, 'A', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (156, 4, 'A', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (157, 4, 'A', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (158, 4, 'A', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (159, 4, 'A', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (160, 4, 'A', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (161, 4, 'B', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (162, 4, 'B', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (163, 4, 'B', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (164, 4, 'B', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (165, 4, 'B', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (166, 4, 'B', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (167, 4, 'B', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (168, 4, 'B', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (169, 4, 'B', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (170, 4, 'B', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (171, 4, 'B', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (172, 4, 'B', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (173, 4, 'B', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (174, 4, 'B', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (175, 4, 'B', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (176, 4, 'C', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (177, 4, 'C', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (178, 4, 'C', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (179, 4, 'C', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (180, 4, 'C', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (181, 4, 'C', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (182, 4, 'C', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (183, 4, 'C', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (184, 4, 'C', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (185, 4, 'C', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (186, 4, 'C', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (187, 4, 'C', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (188, 4, 'C', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (189, 4, 'C', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (190, 4, 'C', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (191, 4, 'D', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (192, 4, 'D', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (193, 4, 'D', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (194, 4, 'D', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (195, 4, 'D', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (196, 4, 'D', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (197, 4, 'D', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (198, 4, 'D', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (199, 4, 'D', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (200, 4, 'D', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (201, 4, 'D', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (202, 4, 'D', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (203, 4, 'D', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (204, 4, 'D', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (205, 4, 'D', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (206, 4, 'E', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (207, 4, 'E', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (208, 4, 'E', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (209, 4, 'E', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (210, 4, 'E', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (211, 4, 'E', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (212, 4, 'E', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (213, 4, 'E', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (214, 4, 'E', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (215, 4, 'E', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (216, 4, 'E', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (217, 4, 'E', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (218, 4, 'E', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (219, 4, 'E', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (220, 4, 'E', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (221, 4, 'F', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (222, 4, 'F', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (223, 4, 'F', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (224, 4, 'F', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (225, 4, 'F', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (226, 4, 'F', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (227, 4, 'F', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (228, 4, 'F', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (229, 4, 'F', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (230, 4, 'F', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (231, 4, 'F', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (232, 4, 'F', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (233, 4, 'F', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (234, 4, 'F', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (235, 4, 'F', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (236, 4, 'G', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (237, 4, 'G', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (238, 4, 'G', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (239, 4, 'G', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (240, 4, 'G', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (241, 4, 'G', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (242, 4, 'G', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (243, 4, 'G', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (244, 4, 'G', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (245, 4, 'G', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (246, 4, 'G', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (247, 4, 'G', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (248, 4, 'G', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (249, 4, 'G', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (250, 4, 'G', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (251, 4, 'H', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (252, 4, 'H', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (253, 4, 'H', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (254, 4, 'H', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (255, 4, 'H', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (256, 4, 'H', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (257, 4, 'H', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (258, 4, 'H', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (259, 4, 'H', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (260, 4, 'H', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (261, 4, 'H', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (262, 4, 'H', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (263, 4, 'H', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (264, 4, 'H', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (265, 4, 'H', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (266, 4, 'I', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (267, 4, 'I', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (268, 4, 'I', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (269, 4, 'I', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (270, 4, 'I', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (271, 4, 'I', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (272, 4, 'I', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (273, 4, 'I', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (274, 4, 'I', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (275, 4, 'I', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (276, 4, 'I', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (277, 4, 'I', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (278, 4, 'I', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (279, 4, 'I', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (280, 4, 'I', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (281, 4, 'J', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (282, 4, 'J', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (283, 4, 'J', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (284, 4, 'J', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (285, 4, 'J', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (286, 4, 'J', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (287, 4, 'J', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (288, 4, 'J', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (289, 4, 'J', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (290, 4, 'J', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (291, 4, 'J', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (292, 4, 'J', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (293, 4, 'J', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (294, 4, 'J', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (295, 4, 'J', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (296, 4, 'K', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (297, 4, 'K', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (298, 4, 'K', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (299, 4, 'K', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (300, 4, 'K', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (301, 4, 'K', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (302, 4, 'K', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (303, 4, 'K', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (304, 4, 'K', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (305, 4, 'K', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (306, 4, 'K', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (307, 4, 'K', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (308, 4, 'K', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (309, 4, 'K', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (310, 4, 'K', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (311, 6, 'A', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (312, 6, 'A', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (313, 6, 'A', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (314, 6, 'A', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (315, 6, 'B', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (316, 6, 'B', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (317, 6, 'B', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (318, 6, 'B', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (319, 6, 'C', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (320, 6, 'C', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (321, 6, 'C', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (322, 6, 'C', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (323, 8, 'A', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (324, 8, 'A', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (325, 8, 'A', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (326, 8, 'A', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (327, 8, 'A', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (328, 8, 'A', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (329, 8, 'A', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (330, 8, 'A', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (331, 8, 'A', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (332, 8, 'A', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (333, 8, 'B', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (334, 8, 'B', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (335, 8, 'B', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (336, 8, 'B', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (337, 8, 'B', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (338, 8, 'B', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (339, 8, 'B', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (340, 8, 'B', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (341, 8, 'B', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (342, 8, 'B', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (343, 8, 'C', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (344, 8, 'C', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (345, 8, 'C', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (346, 8, 'C', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (347, 8, 'C', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (348, 8, 'C', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (349, 8, 'C', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (350, 8, 'C', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (351, 8, 'C', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (352, 8, 'C', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (353, 8, 'D', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (354, 8, 'D', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (355, 8, 'D', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (356, 8, 'D', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (357, 8, 'D', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (358, 8, 'D', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (359, 8, 'D', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (360, 8, 'D', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (361, 8, 'D', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (362, 8, 'D', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (363, 8, 'E', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (364, 8, 'E', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (365, 8, 'E', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (366, 8, 'E', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (367, 8, 'E', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (368, 8, 'E', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (369, 8, 'E', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (370, 8, 'E', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (371, 8, 'E', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (372, 8, 'E', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (373, 8, 'F', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (374, 8, 'F', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (375, 8, 'F', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (376, 8, 'F', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (377, 8, 'F', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (378, 8, 'F', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (379, 8, 'F', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (380, 8, 'F', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (381, 8, 'F', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (382, 8, 'F', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (383, 8, 'G', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (384, 8, 'G', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (385, 8, 'G', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (386, 8, 'G', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (387, 8, 'G', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (388, 8, 'G', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (389, 8, 'G', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (390, 8, 'G', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (391, 8, 'G', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (392, 8, 'G', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (393, 8, 'H', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (394, 8, 'H', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (395, 8, 'H', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (396, 8, 'H', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (397, 8, 'H', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (398, 8, 'H', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (399, 8, 'H', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (400, 8, 'H', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (401, 8, 'H', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (402, 8, 'H', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (403, 8, 'I', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (404, 8, 'I', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (405, 8, 'I', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (406, 8, 'I', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (407, 8, 'I', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (408, 8, 'I', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (409, 8, 'I', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (410, 8, 'I', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (411, 8, 'I', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (412, 8, 'I', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (413, 8, 'J', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (414, 8, 'J', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (415, 8, 'J', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (416, 8, 'J', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (417, 8, 'J', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (418, 8, 'J', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (419, 8, 'J', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (420, 8, 'J', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (421, 8, 'J', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (422, 8, 'J', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (423, 8, 'K', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (424, 8, 'K', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (425, 8, 'K', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (426, 8, 'K', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (427, 8, 'K', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (428, 8, 'K', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (429, 8, 'K', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (430, 8, 'K', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (431, 8, 'K', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (432, 8, 'K', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (433, 8, 'L', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (434, 8, 'L', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (435, 8, 'L', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (436, 8, 'L', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (437, 8, 'L', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (438, 8, 'L', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (439, 8, 'L', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (440, 8, 'L', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (441, 8, 'L', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (442, 8, 'L', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (443, 8, 'M', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (444, 8, 'M', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (445, 8, 'M', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (446, 8, 'M', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (447, 8, 'M', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (448, 8, 'M', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (449, 8, 'M', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (450, 8, 'M', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (451, 8, 'M', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (452, 8, 'M', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (453, 8, 'N', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (454, 8, 'N', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (455, 8, 'N', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (456, 8, 'N', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (457, 8, 'N', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (458, 8, 'N', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (459, 8, 'N', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (460, 8, 'N', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (461, 8, 'N', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (462, 8, 'N', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (463, 9, 'A', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (464, 9, 'A', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (465, 9, 'A', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (466, 9, 'A', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (467, 9, 'A', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (468, 9, 'A', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (469, 9, 'A', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (470, 9, 'A', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (471, 9, 'A', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (472, 9, 'A', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (473, 9, 'B', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (474, 9, 'B', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (475, 9, 'B', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (476, 9, 'B', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (477, 9, 'B', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (478, 9, 'B', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (479, 9, 'B', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (480, 9, 'B', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (481, 9, 'B', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (482, 9, 'B', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (483, 9, 'C', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (484, 9, 'C', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (485, 9, 'C', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (486, 9, 'C', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (487, 9, 'C', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (488, 9, 'C', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (489, 9, 'C', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (490, 9, 'C', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (491, 9, 'C', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (492, 9, 'C', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (493, 9, 'C', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (494, 9, 'C', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (495, 9, 'C', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (496, 9, 'C', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (497, 9, 'C', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (498, 9, 'C', '16', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (499, 9, 'C', '17', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (500, 9, 'C', '18', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (501, 9, 'D', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (502, 9, 'D', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (503, 9, 'D', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (504, 9, 'D', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (505, 9, 'D', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (506, 9, 'D', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (507, 9, 'D', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (508, 9, 'D', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (509, 9, 'D', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (510, 9, 'D', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (511, 9, 'D', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (512, 9, 'D', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (513, 9, 'D', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (514, 9, 'D', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (515, 9, 'D', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (516, 9, 'D', '16', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (517, 9, 'D', '17', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (518, 9, 'D', '18', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (519, 9, 'E', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (520, 9, 'E', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (521, 9, 'E', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (522, 9, 'E', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (523, 9, 'E', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (524, 9, 'E', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (525, 9, 'E', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (526, 9, 'E', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (527, 9, 'E', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (528, 9, 'E', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (529, 9, 'E', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (530, 9, 'E', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (531, 9, 'E', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (532, 9, 'E', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (533, 9, 'E', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (534, 9, 'E', '16', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (535, 9, 'E', '17', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (536, 9, 'E', '18', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (537, 9, 'F', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (538, 9, 'F', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (539, 9, 'F', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (540, 9, 'F', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (541, 9, 'F', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (542, 9, 'F', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (543, 9, 'F', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (544, 9, 'F', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (545, 9, 'F', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (546, 9, 'F', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (547, 9, 'F', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (548, 9, 'F', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (549, 9, 'F', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (550, 9, 'F', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (551, 9, 'F', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (552, 9, 'F', '16', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (553, 9, 'F', '17', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (554, 9, 'F', '18', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (555, 9, 'G', '1', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (556, 9, 'G', '2', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (557, 9, 'G', '3', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (558, 9, 'G', '4', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (559, 9, 'G', '5', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (560, 9, 'G', '6', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (561, 9, 'G', '7', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (562, 9, 'G', '8', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (563, 9, 'G', '9', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (564, 9, 'G', '10', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (565, 9, 'G', '11', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (566, 9, 'G', '12', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (567, 9, 'G', '13', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (568, 9, 'G', '14', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (569, 9, 'G', '15', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (570, 9, 'G', '16', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (571, 9, 'G', '17', 'STANDARD');
INSERT INTO public.seats (seat_id, venue_id, seat_row, seat_number, seat_type) VALUES (572, 9, 'G', '18', 'STANDARD');

-- tickets
INSERT INTO public.tickets (ticket_id, event_id, seat_id, cart_id, order_id, ticket_code, price, status)
VALUES (1, 8, 165, NULL, 1, 'E8-8D291BBE', 1190.00, 'ISSUED');

INSERT INTO public.tickets (ticket_id, event_id, seat_id, cart_id, order_id, ticket_code, price, status)
VALUES (2, 8, 166, NULL, 1, 'E8-E52846E4', 1190.00, 'ISSUED');

INSERT INTO public.tickets (ticket_id, event_id, seat_id, cart_id, order_id, ticket_code, price, status)
VALUES (3, 6, NULL, NULL, 2, 'E6-6A52A104', 790.00, 'ISSUED');

INSERT INTO public.tickets (ticket_id, event_id, seat_id, cart_id, order_id, ticket_code, price, status)
VALUES (4, 6, NULL, NULL, 2, 'E6-DF5F9BD5', 790.00, 'ISSUED');

INSERT INTO public.tickets (ticket_id, event_id, seat_id, cart_id, order_id, ticket_code, price, status)
VALUES (5, 6, NULL, NULL, 2, 'E6-F866F642', 790.00, 'ISSUED');

INSERT INTO public.tickets (ticket_id, event_id, seat_id, cart_id, order_id, ticket_code, price, status)
VALUES (6, 6, NULL, NULL, 2, 'E6-DB1C5A20', 790.00, 'ISSUED');

-- sequence alignment (z dumpu)
SELECT pg_catalog.setval('public.carts_cart_id_seq', 1, true);
SELECT pg_catalog.setval('public.events_event_id_seq', 10, true);
SELECT pg_catalog.setval('public.orders_order_id_seq', 2, true);
SELECT pg_catalog.setval('public.seats_seat_id_seq', 572, true);
SELECT pg_catalog.setval('public.tickets_ticket_id_seq', 6, true);
SELECT pg_catalog.setval('public.users_user_id_seq', 2, true);
SELECT pg_catalog.setval('public.venues_venue_id_seq', 9, true);
