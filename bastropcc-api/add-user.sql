INSERT INTO users (id, email, password_hash, role, name, is_active)
VALUES (
  'user-' || hex(randomblob(16)),
  'skyabove@gmail.com',
  '$2b$10$v6J9UPuwyQAR4K0qcdFfwOMv0aMh1/1/b1CVEZXztvh3j1PznlKSW',
  'admin',
  'Skyabove',
  1
);
