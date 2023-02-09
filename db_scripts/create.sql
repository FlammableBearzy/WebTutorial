-- CREATE DATABASE

-- in case i need to delete
DROP TABLE IF EXISTS cards CASCADE;


-- Reminder, this will hold all the information about the existing cards.
create table cards (
crd_id SERIAL NOT null,
crd_name varchar(60) not null, 
crd_img_url varchar(200), -- What if we have more than 1 image?
crd_lore varchar(400), --  Story about the card, for example someone telling what their doing (example: "Call the catapults, we siege by midday")
crd_description varchar(300), -- Short description of what the card does (example: deal 3 damage)
crd_level int not null, -- Cards of higher level cannot be played in the beggining
crd_cost int,
crd_timeout int, -- While on timeout the card cannot be played (This is a cooldown)
crd_max_usage int, -- This is maximum card usages, like a resource.
crd_type int not null, -- This defines what type of card it is (example: attack card or movement card)
-- if there's multiple card types, we should add more tables. (example:In case it is an attack card from 1 element. "Attack type1" + "Fire type1")
primary key (crd_id)
);

