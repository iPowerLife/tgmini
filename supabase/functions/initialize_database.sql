create or replace function initialize_database()
returns void
language plpgsql
security definer
as $$
begin
  -- Создаем таблицу пользователей, если её нет
  create table if not exists users (
    id serial primary key,
    telegram_id bigint unique not null,
    username text,
    balance decimal default 0,
    mining_power decimal default 1,
    level integer default 1,
    experience integer default 0,
    next_level_exp integer default 100,
    last_mining timestamp default now(),
    created_at timestamp default now(),
    updated_at timestamp default now()
  );

  -- Создаем таблицу транзакций, если её нет
  create table if not exists transactions (
    id serial primary key,
    user_id integer references users(id),
    amount decimal not null,
    type text not null,
    description text,
    created_at timestamp default now()
  );

  -- Создаем таблицу уровней, если её нет
  create table if not exists levels (
    id serial primary key,
    level integer unique not null,
    exp_required integer not null,
    reward decimal not null,
    description text
  );
end;
$$;

