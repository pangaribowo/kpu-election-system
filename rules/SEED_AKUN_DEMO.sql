-- SEED ADMIN
INSERT INTO users (username, name, role, email, phone)
VALUES
('admin1', 'Admin Satu', 'admin', 'admin1@example.com', '+6281111111111'),
('admin2', 'Admin Dua', 'admin', 'admin2@example.com', '+6281111111112'),
('admin3', 'Admin Tiga', 'admin', 'admin3@example.com', '+6281111111113'),
('admin4', 'Admin Empat', 'admin', 'admin4@example.com', '+6281111111114'),
('admin5', 'Admin Lima', 'admin', 'admin5@example.com', '+6281111111115')
ON CONFLICT (username) DO NOTHING;

-- SEED USER
INSERT INTO users (username, name, role, email, phone)
VALUES
('user1', 'User Satu', 'user', 'user1@example.com', '+6281222222201'),
('user2', 'User Dua', 'user', 'user2@example.com', '+6281222222202'),
('user3', 'User Tiga', 'user', 'user3@example.com', '+6281222222203'),
('user4', 'User Empat', 'user', 'user4@example.com', '+6281222222204'),
('user5', 'User Lima', 'user', 'user5@example.com', '+6281222222205'),
('user6', 'User Enam', 'user', 'user6@example.com', '+6281222222206'),
('user7', 'User Tujuh', 'user', 'user7@example.com', '+6281222222207'),
('user8', 'User Delapan', 'user', 'user8@example.com', '+6281222222208'),
('user9', 'User Sembilan', 'user', 'user9@example.com', '+6281222222209'),
('user10', 'User Sepuluh', 'user', 'user10@example.com', '+6281222222210')
ON CONFLICT (username) DO NOTHING;

-- SEED KANDIDAT
INSERT INTO kandidat (nama, visi, misi, foto_url)
VALUES
('Kandidat 1', 'Visi Kandidat 1', 'Misi Kandidat 1', NULL),
('Kandidat 2', 'Visi Kandidat 2', 'Misi Kandidat 2', NULL)
ON CONFLICT (nama) DO NOTHING;
