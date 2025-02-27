-- Добавление колонок для системы уровней в таблицу users
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN experience INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN next_level_exp INTEGER DEFAULT 100;

-- Таблица для хранения информации об уровнях
CREATE TABLE levels (
    id SERIAL PRIMARY KEY,
    level INTEGER UNIQUE NOT NULL,
    exp_required INTEGER NOT NULL,
    reward DECIMAL NOT NULL,
    description TEXT
);

-- Заполнение таблицы уровней
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

