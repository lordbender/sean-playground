create table if not exists playground_events (
    id bigserial primary key,
    event_name text not null,
    created_at timestamptz not null default now()
);

insert into playground_events (event_name)
values ('Sean''s Playground initialized')
on conflict do nothing;

