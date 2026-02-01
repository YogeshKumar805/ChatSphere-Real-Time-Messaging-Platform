-- Chat App schema (MySQL 8+)
CREATE DATABASE IF NOT EXISTS chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chat_app;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (name) VALUES ('admin'), ('user');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NULL,
  status ENUM('active','expired','pending','blocked') NOT NULL DEFAULT 'pending',
  trial_ends_at DATETIME NULL,
  access_ends_at DATETIME NULL,
  invited_by_user_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_users_invited_by FOREIGN KEY (invited_by_user_id) REFERENCES users(id)
);

-- Invite codes (one-time use)
CREATE TABLE IF NOT EXISTS invite_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  generated_by_user_id BIGINT NOT NULL,
  used_by_user_id BIGINT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME NULL,
  CONSTRAINT fk_invite_generated_by FOREIGN KEY (generated_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_invite_used_by FOREIGN KEY (used_by_user_id) REFERENCES users(id)
);

-- Requests (user -> admin for access after expiry)
CREATE TABLE IF NOT EXISTS access_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME NULL,
  decided_by_admin_id BIGINT NULL,
  note VARCHAR(500) NULL,
  duration ENUM('1_day','7_days','1_month','3_months') NULL,
  CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_request_admin FOREIGN KEY (decided_by_admin_id) REFERENCES users(id)
);

-- Subscriptions (approved access windows)
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  source ENUM('trial','admin_approval') NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_id BIGINT NULL,
  CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_sub_request FOREIGN KEY (request_id) REFERENCES access_requests(id)
);

-- Chats (1:1 only for now)
CREATE TABLE IF NOT EXISTS chats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('direct') NOT NULL DEFAULT 'direct',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chat participants
CREATE TABLE IF NOT EXISTS chat_participants (
  chat_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(chat_id, user_id),
  CONSTRAINT fk_cp_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chat_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  body TEXT NOT NULL,
  type ENUM('text') NOT NULL DEFAULT 'text',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME NULL,
  read_at DATETIME NULL,
  CONSTRAINT fk_msg_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_chat_created (chat_id, created_at)
);

-- Calls (metadata)
CREATE TABLE IF NOT EXISTS calls (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chat_id BIGINT NOT NULL,
  caller_id BIGINT NOT NULL,
  callee_id BIGINT NOT NULL,
  status ENUM('initiated','ringing','accepted','ended','missed','rejected') NOT NULL DEFAULT 'initiated',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_call_chat FOREIGN KEY (chat_id) REFERENCES chats(id),
  CONSTRAINT fk_call_caller FOREIGN KEY (caller_id) REFERENCES users(id),
  CONSTRAINT fk_call_callee FOREIGN KEY (callee_id) REFERENCES users(id)
);

-- Seed an admin (password: Admin@123)
-- NOTE: bcrypt hash precomputed for "Admin@123" (cost 10). Replace in production.
INSERT IGNORE INTO users (role_id, email, password_hash, name, status)
SELECT r.id, 'admin@example.com',
'$2b$10$eGdZ8I4Yul6vZ3yQih8dJe9i9Pwqkz8Z1mbE2W3m5gAq7Zp5A4r2m',
'System Admin', 'active'
FROM roles r WHERE r.name='admin';
