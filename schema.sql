-- ============================================
-- PORTFOLIO DATABASE SCHEMA
-- Run this file in MySQL to set up the database
-- ============================================

CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) NULL,
  reset_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tech_stack JSON NOT NULL,
  status ENUM('DEPLOYED', 'LIVE', 'PROD', 'WIP', 'ARCHIVED') DEFAULT 'WIP',
  github_url VARCHAR(500),
  live_url VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  level INT NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Experience Table
CREATE TABLE IF NOT EXISTS experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  type ENUM('FULL_TIME', 'INTERNSHIP', 'FREELANCE', 'CONTRACT') DEFAULT 'FULL_TIME',
  bullets JSON NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  excerpt TEXT,
  tags JSON,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA (Initial data to get started)
-- ============================================

-- IMPORTANT: Replace this password hash with a bcrypt hash of your actual password
-- Default password is: admin123  (change it!)
INSERT IGNORE INTO admin_users (username, password_hash) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO');

-- Seed Projects
INSERT IGNORE INTO projects (id, title, description, tech_stack, status, github_url, live_url, featured) VALUES
(1, 'E-Commerce Platform', 'Full-stack e-commerce engine with cart, payments, and admin dashboard. Handles 1000+ concurrent users.', '["Node.js", "React", "MySQL", "Stripe"]', 'DEPLOYED', 'https://github.com', 'https://example.com', TRUE),
(2, 'Real-Time Chat System', 'Socket.io-powered messaging platform with real-time delivery and persistent history.', '["React", "Express", "Socket.io", "MongoDB"]', 'LIVE', 'https://github.com', NULL, TRUE),
(3, 'API Gateway Service', 'Centralized RESTful API gateway with JWT auth, rate limiting, and request validation.', '["Node.js", "Express", "JWT", "MySQL"]', 'PROD', 'https://github.com', NULL, FALSE);

-- Seed Skills
INSERT IGNORE INTO skills (id, name, category, level, sort_order) VALUES
(1, 'Node.js', 'BACKEND', 90, 1),
(2, 'Express.js', 'BACKEND', 85, 2),
(3, 'MySQL', 'DATABASE', 80, 3),
(4, 'React', 'FRONTEND', 88, 4),
(5, 'JavaScript', 'LANGUAGE', 92, 5),
(6, 'Tailwind CSS', 'STYLING', 90, 6),
(7, 'GSAP', 'ANIMATION', 70, 7),
(8, 'Three.js', '3D', 65, 8),
(9, 'REST APIs', 'ARCHITECTURE', 88, 9),
(10, 'Git/GitHub', 'TOOLS', 85, 10);

-- Seed Experience
INSERT IGNORE INTO experience (id, role, company, duration, type, bullets, sort_order) VALUES
(1, 'SOFTWARE DEVELOPER', 'Tech Solutions Inc.', '2023 — PRESENT', 'FULL_TIME', '["Architected RESTful APIs serving 50k+ requests/day with Node.js + Express.", "Reduced query latency by 40% through MySQL indexing and query optimization.", "Built React frontend apps with real-time data via WebSocket integration."]', 1),
(2, 'BACKEND INTERN', 'Startup Co.', '2022 — 2023', 'INTERNSHIP', '["Developed core CRUD APIs for an e-commerce platform.", "Collaborated with frontend engineers on API contract design.", "Implemented JWT authentication and role-based access control."]', 2);

-- Gear (Affiliate) Table
CREATE TABLE IF NOT EXISTS gear (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  affiliate_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Gear
INSERT IGNORE INTO gear (id, title, category, description, image_url, affiliate_url, sort_order) VALUES
(1, 'MacBook Pro 16" (M3 Max)', 'HARDWARE', 'My primary workhorse for full-stack development and heavy lifting.', 'https://m.media-amazon.com/images/I/61bwiPRcv2L._AC_SL1500_.jpg', 'https://amazon.com', 1),
(2, 'Keychron K2 Wireless Mechanical Keyboard', 'ACCESSORIES', 'Tactile, satisfying, and essential for long coding sessions.', 'https://m.media-amazon.com/images/I/61D4Z3yN8aL._AC_SL1500_.jpg', 'https://amazon.com', 2),
(3, 'Clean Code by Robert C. Martin', 'BOOKS', 'The must-read handbook for writing elegant, maintainable code.', 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg', 'https://amazon.com', 3);
