-- Skema Tabel User
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- hashed
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'user')),
    name VARCHAR(100) NOT NULL
);

-- Skema Tabel Kandidat
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vision TEXT NOT NULL,
    color VARCHAR(20) NOT NULL,
    votes INTEGER DEFAULT 0
); 