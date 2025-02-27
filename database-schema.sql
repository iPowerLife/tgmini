-- Таблица пользователей
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  balance DECIMAL DEFAULT 0,
  mining_power DECIMAL DEFAULT 1,
  last_mining TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица майнеров (оборудования)
CREATE TABLE miners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  power DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  image_url TEXT,
  description TEXT
);

-- Таблица инвентаря пользователей
CREATE TABLE user_miners (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  miner_id INTEGER REFERENCES miners(id),
  quantity INTEGER DEFAULT 1,
  purchased_at TIMESTAMP DEFAULT NOW()
);

-- Таблица транзакций
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL, -- 'mining', 'purchase', 'upgrade'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Начальные данные для майнеров
INSERT INTO miners (name, power, price, description) VALUES
('Базовый компьютер', 0.1, 0, 'Начальный майнер для всех пользователей'),
('Видеокарта GTX 1060', 0.5, 100, 'Улучшенная производительность майнинга'),
('Видеокарта RTX 3080', 2.0, 500, 'Высокая производительность майнинга'),
('ASIC Miner', 5.0, 2000, 'Профессиональное оборудование для майнинга'),
('Майнинг ферма', 15.0, 10000, 'Максимальная производительность майнинга');

