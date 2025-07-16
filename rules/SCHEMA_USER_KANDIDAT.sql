-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DROP tabel jika ada (urutan: voting, kandidat, users)
DROP TABLE IF EXISTS voting;
DROP TABLE IF EXISTS kandidat;
DROP TABLE IF EXISTS users;

-- Tabel users (UUID, tanpa kolom password)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel kandidat (UUID)
CREATE TABLE kandidat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL UNIQUE,
  visi TEXT,
  misi TEXT,
  foto_url TEXT,
  color VARCHAR(32) DEFAULT 'blue',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel voting (UUID)
CREATE TABLE voting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kandidat_id UUID REFERENCES kandidat(id) ON DELETE CASCADE,
  waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
); 