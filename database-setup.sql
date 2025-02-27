-- Таблица пользователей
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  balance DECIMAL DEFAULT 0,
  mining_power DECIMAL DEFAULT 1,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  next_level_exp INTEGER DEFAULT 100,
  last_mining TIMESTAMP DEFAULT NOW(),
  last_bonus_date TIMESTAMP,
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
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица уровней
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  level INTEGER UNIQUE NOT NULL,
  exp_required INTEGER NOT NULL,
  reward DECIMAL NOT NULL,
  description TEXT
);

-- Добавление начальных данных для майнеров
INSERT INTO miners (name, power, price, description) VALUES
('Базовый компьютер', 0.1, 0, 'Начальный майнер для всех пользователей'),
('Видеокарта GTX 1060', 0.5, 100, 'Улучшенная производительность майнинга'),
('Видеокарта RTX 3080', 2.0, 500, 'Высокая производительность майнинга'),
('ASIC Miner', 5.0, 2000, 'Профессиональное оборудование для майнинга'),
('Майнинг ферма', 15.0, 10000, 'Максимальная производительность майнинга');

-- Добавление данных для уровней
INSERT INTO levels (level, exp_required, reward, description) VALUES
(1, 0, 0, 'Новичок'),
(2, 100, 50, 'Начинающий майнер'),
(3, 300, 100, 'Опытный майнер'),
(4, 600, 200, 'Продвинутый майнер'),
(5, 1000, 300, 'Профессиональный майнер'),
(6, 1500, 400, 'Мастер майнинга'),
(7, 2100, 500, 'Эксперт майнинга'),
(8, 2800, 600, 'Гуру майнинга'),
(9, 3600, 700, 'Легенда майнинга'),
(10, 4500, 1000, 'Криптокороль');

