-- Seed akun demo ke tabel users Supabase
INSERT INTO users (username, password, role, name)
VALUES
  ('admin', '$2b$10$3MKHOMCtrGbHWEqXaFtq6O4XSnSDNC9g107Wqj5u/BNr7tmVHgI.e', 'admin', 'Administrator'),
  ('user', '$2b$10$nrubC73YD5IgEwSS3HX7wOuRAipx1J76f7BLK2VX6ZMZF87Svflhu', 'user', 'Pemilih'); 