-- MindSpace MySQL schema
-- Run this script once to set up the database before starting the server.

CREATE DATABASE IF NOT EXISTS mindspace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mindspace;

-- Mood entries
CREATE TABLE IF NOT EXISTS moods (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  emoji      VARCHAR(20)  NOT NULL DEFAULT '',
  label      VARCHAR(50)  NOT NULL DEFAULT '',
  note       TEXT,
  date       VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Journal entries  (id is Date.now() from the client)
CREATE TABLE IF NOT EXISTS journals (
  id          BIGINT       PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NOT NULL,
  date        VARCHAR(100) NOT NULL DEFAULT '',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Single profile row (id is always 1)
CREATE TABLE IF NOT EXISTS profile (
  id         INT          PRIMARY KEY DEFAULT 1,
  name       VARCHAR(100) NOT NULL DEFAULT '',
  age        VARCHAR(10)  NOT NULL DEFAULT '',
  streak     INT          NOT NULL DEFAULT 0,
  last_visit VARCHAR(100) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the profile row so GET /api/profile always returns a row
INSERT IGNORE INTO profile (id, name, age, streak, last_visit)
VALUES (1, '', '', 0, '');

-- Habit tracker rows (one row per habit per year/month)
-- marks is stored as a JSON object: { "1": true, "3": true, ... }
CREATE TABLE IF NOT EXISTS habits (
  id         BIGINT       PRIMARY KEY,
  year       SMALLINT     NOT NULL,
  month      TINYINT      NOT NULL,
  name       VARCHAR(200) NOT NULL,
  goal       INT          NOT NULL DEFAULT 1,
  marks      JSON         NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_year_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
