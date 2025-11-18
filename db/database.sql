
CREATE TABLE IF NOT EXISTS puntuaciones (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    juego_favorito VARCHAR(100),
    mensaje TEXT
);

INSERT INTO puntuaciones (nickname, juego_favorito, mensaje) VALUES 
('PlayerOne', 'Elden Ring', '¡El mejor juego de la historia!'),
('NoobMaster', 'Fortnite', 'Buscando duo para rankeds.');