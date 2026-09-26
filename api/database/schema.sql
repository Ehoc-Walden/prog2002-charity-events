-- PROG2002 Assessment 2 - Charity Events database schema
-- Target: MySQL 8.0+
-- Run this file first, then run seed.sql.

DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE charityevents_db;

CREATE TABLE organisations (
  organisation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  tagline VARCHAR(220) NOT NULL,
  mission TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_email VARCHAR(190) NOT NULL,
  contact_phone VARCHAR(40) NOT NULL,
  website_url VARCHAR(255) NULL,
  logo_key VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_organisations_active CHECK (is_active IN (0, 1))
) ENGINE=InnoDB;

CREATE TABLE categories (
  category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  accent_colour CHAR(7) NOT NULL DEFAULT '#17B7A5',
  icon_key VARCHAR(60) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_categories_active CHECK (is_active IN (0, 1)),
  CONSTRAINT chk_categories_colour CHECK (accent_colour REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB;

CREATE TABLE venues (
  venue_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  address_line_1 VARCHAR(180) NOT NULL,
  suburb VARCHAR(100) NOT NULL,
  state_code CHAR(3) NOT NULL,
  postcode CHAR(4) NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'AU',
  latitude DECIMAL(9, 6) NULL,
  longitude DECIMAL(9, 6) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_venues_location (suburb, state_code),
  CONSTRAINT chk_venues_postcode CHECK (postcode REGEXP '^[0-9]{4}$')
) ENGINE=InnoDB;

CREATE TABLE events (
  event_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organisation_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  venue_id INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  summary VARCHAR(380) NOT NULL,
  purpose VARCHAR(260) NOT NULL,
  description TEXT NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Australia/Sydney',
  ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'AUD',
  is_free TINYINT(1) NOT NULL DEFAULT 0,
  goal_amount DECIMAL(12, 2) NOT NULL,
  raised_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  capacity INT UNSIGNED NULL,
  hero_image_key VARCHAR(255) NOT NULL,
  status ENUM('draft', 'published', 'suspended', 'cancelled') NOT NULL DEFAULT 'draft',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_organisation FOREIGN KEY (organisation_id) REFERENCES organisations (organisation_id),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories (category_id),
  CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues (venue_id),
  CONSTRAINT chk_events_dates CHECK (end_datetime > start_datetime),
  CONSTRAINT chk_events_price CHECK (ticket_price >= 0),
  CONSTRAINT chk_events_goal CHECK (goal_amount > 0),
  CONSTRAINT chk_events_raised CHECK (raised_amount >= 0),
  CONSTRAINT chk_events_free CHECK (is_free IN (0, 1)),
  CONSTRAINT chk_events_featured CHECK (is_featured IN (0, 1)),
  INDEX idx_events_start_status (start_datetime, status),
  INDEX idx_events_category (category_id),
  INDEX idx_events_organisation (organisation_id),
  INDEX idx_events_location (venue_id)
) ENGINE=InnoDB;

CREATE TABLE event_highlights (
  highlight_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  display_order TINYINT UNSIGNED NOT NULL DEFAULT 1,
  title VARCHAR(120) NOT NULL,
  detail VARCHAR(300) NOT NULL,
  CONSTRAINT fk_highlights_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE CASCADE,
  CONSTRAINT uq_event_highlight_order UNIQUE (event_id, display_order)
) ENGINE=InnoDB;
