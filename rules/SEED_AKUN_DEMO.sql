-- Akun demo admin
INSERT INTO users (username, password, name, role)
VALUES ('admin', '$2a$10$w1QwQn6Qn6Qn6Qn6Qn6QnOQn6Qn6Qn6Qn6Qn6Qn6Qn6Qn6Qn6Qn6', 'Admin Demo', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Akun demo user
INSERT INTO users (username, password, name, role)
VALUES ('user', '$2a$10$w1QwQn6Qn6Qn6Qn6Qn6QnOQn6Qn6Qn6Qn6Qn6Qn6Qn6Qn6Qn6', 'User Demo', 'user')
ON CONFLICT (username) DO NOTHING;

-- Kandidat contoh
INSERT INTO kandidat (nama, visi, misi, foto_url)
VALUES
('Kandidat 1', 'Visi Kandidat 1', 'Misi Kandidat 1', NULL),
('Kandidat 2', 'Visi Kandidat 2', 'Misi Kandidat 2', NULL)
ON CONFLICT (nama) DO NOTHING; 