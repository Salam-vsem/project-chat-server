-- create sequence "test-sequence";
-- SELECT * FROM information_schema.sequences;
-- select nextval('test-sequence');
-- select currval('test-sequence');
-- select setval('test-sequence', 1);

-- create type pk as integer not null primary key default nextval('sequence_rooms');

create sequence if not exists sequence_rooms;
create table if not exists rooms (
    id integer not null primary key default nextval('sequence_rooms'),
    name varchar not null,
    description varchar default '',
    avatar varchar,

    unique(name)
);

create sequence if not exists sequence_users;
create table if not exists users (
    id integer not null primary key default nextval('sequence_users'),
    login varchar(32) not null,
    password char(64) not null,
    is_admin bool not null default false,
    avatar varchar,
    theme jsonb default '{"color": "#7e8eb8", "fontScale": 1, "borderRadius": 12, "structure": "default"}',
    
    unique(login)
);

create sequence if not exists "sequence_messages";
create type "messages_type" as enum ('text', 'img', 'doc', 'video', 'room_created', 'audio');
create type "messages_room_event_type" as enum ('join', 'leave');

create table if not exists "messages" (
    id integer not null primary key default nextval('sequence_messages'),
    type "messages_type" not null,
    room_id integer,
    user_id integer,
    content varchar(1000) not null,
    date timestamp not null default now(),

    constraint fk_messages_room foreign key (room_id) references rooms (id) on delete cascade,
    constraint fk_messages_user foreign key (user_id) references users (id) on delete set null
);

-- create table if not exists "messages_text" (
--     id serial primary key,
--     text varchar(5000) not null,
--     message_id integer not null,

--     unique(message_id),
--     constraint fk_messages_text_message_id foreign key (message_id) references messages (id) on delete cascade
-- );

-- create table if not exists "messages_room_event" (
--     id serial primary key,
--     event_type "messages_room_event_type" not null,
--     message_id integer not null,

--     unique(message_id),
--     constraint fk_messages_text_message_id foreign key (message_id) references messages (id) on delete cascade
-- );

create table if not exists auth_sessions (
    token varchar(128) not null primary key,
    user_id integer not null,
    expires timestamp not null,
    
    constraint fk_auth_session_user foreign key (user_id) references users (id) on delete cascade
);

create table if not exists "users_rooms" (
    id serial primary key, 
    user_id integer not null,
    room_id integer not null,
    
    constraint fk_users_rooms_user_id foreign key (user_id) references users (id) on delete cascade,
    constraint fk_users_rooms_room_id foreign key (room_id) references rooms (id) on delete cascade
);

create view rooms_list as (
    select "rooms".id, name,
    -- case
    --     when length(description) < 25 then description
    --     else concat(substring(description, 1, 25), '...')
    -- end
    -- as short_description, 
    description,
    count("messages".id) as "messagesCount"
    -- '{}'::jsonb as users 
    from "rooms" 
    left join "messages" on messages.room_id = rooms.id 
    group by rooms.id
);
