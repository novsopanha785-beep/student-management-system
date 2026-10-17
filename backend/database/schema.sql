-- Student Management System - database schema
-- Run with:  mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS student_management_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_management_system;

CREATE TABLE IF NOT EXISTS students (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id      VARCHAR(30)  NOT NULL,
  full_name       VARCHAR(120) NOT NULL,
  gender          ENUM('Male', 'Female', 'Other') NOT NULL,
  date_of_birth   DATE         NOT NULL,
  email           VARCHAR(150) NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  course          VARCHAR(100) NOT NULL,
  academic_year   TINYINT UNSIGNED NOT NULL,
  class_name      VARCHAR(50)  NOT NULL,
  address         VARCHAR(255) NOT NULL,
  enrollment_date DATE         NOT NULL,
  status          ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_student_id (student_id),
  UNIQUE KEY uq_students_email (email),
  KEY idx_students_course (course),
  KEY idx_students_class (class_name),
  KEY idx_students_status (status),
  KEY idx_students_full_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional sample data (safe to re-run: duplicates are ignored)
INSERT IGNORE INTO students
  (student_id, full_name, gender, date_of_birth, email, phone, course, academic_year, class_name, address, enrollment_date, status)
VALUES
  ('STU-0001', 'Sokha Chan',    'Female', '2003-04-12', 'sokha.chan@example.com',    '+855 12 345 678', 'Computer Science',              2, 'CS-2A',  'Phnom Penh', '2024-09-02', 'Active'),
  ('STU-0002', 'Dara Kim',      'Male',   '2002-11-05', 'dara.kim@example.com',      '+855 12 456 789', 'Management Information System', 3, 'MIS-3A', 'Siem Reap',  '2023-09-04', 'Active'),
  ('STU-0003', 'Sophea Lim',    'Female', '2004-01-23', 'sophea.lim@example.com',    '+855 15 567 890', 'Business Administration',       1, 'BA-1A',  'Battambang', '2025-09-01', 'Active'),
  ('STU-0004', 'Vannak Sok',    'Male',   '2001-07-30', 'vannak.sok@example.com',    '+855 16 678 901', 'Computer Science',              4, 'CS-4A',  'Kampot',     '2022-09-05', 'Inactive'),
  ('STU-0005', 'Channary Heng', 'Female', '2003-09-17', 'channary.heng@example.com', '+855 17 789 012', 'Graphic Design',                2, 'GD-2B',  'Phnom Penh', '2024-09-02', 'Active'),
  ('STU-0006', 'Rithy Pov',     'Male',   '2002-02-08', 'rithy.pov@example.com',     '+855 11 890 123', 'Civil Engineering',             3, 'CE-3A',  'Kandal',     '2023-09-04', 'Active'),
  ('STU-0007', 'Maly Touch',    'Female', '2004-06-14', 'maly.touch@example.com',    '+855 10 901 234', 'Business Administration',       1, 'BA-1B',  'Takeo',      '2025-09-01', 'Inactive'),
  ('STU-0008', 'Piseth Ouk',    'Male',   '2003-12-01', 'piseth.ouk@example.com',    '+855 96 012 345', 'Graphic Design',                2, 'GD-2B',  'Phnom Penh', '2024-09-02', 'Active');
