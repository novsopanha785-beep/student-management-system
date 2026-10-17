-- Run this ONCE if you already created the database with the old schema.sql.
-- It adds the "class" column to the existing students table and keeps your data.
-- (Fresh installs do not need it: the new schema.sql already includes the column.)

USE student_management_system;

ALTER TABLE students
  ADD COLUMN class_name VARCHAR(50) NOT NULL DEFAULT 'Unassigned' AFTER academic_year,
  ADD KEY idx_students_class (class_name);

-- Give the 8 sample students a class (rows you added yourself stay "Unassigned"; edit them in the app)
UPDATE students SET class_name = 'CS-2A'  WHERE student_id = 'STU-0001';
UPDATE students SET class_name = 'MIS-3A' WHERE student_id = 'STU-0002';
UPDATE students SET class_name = 'BA-1A'  WHERE student_id = 'STU-0003';
UPDATE students SET class_name = 'CS-4A'  WHERE student_id = 'STU-0004';
UPDATE students SET class_name = 'GD-2B'  WHERE student_id = 'STU-0005';
UPDATE students SET class_name = 'CE-3A'  WHERE student_id = 'STU-0006';
UPDATE students SET class_name = 'BA-1B'  WHERE student_id = 'STU-0007';
UPDATE students SET class_name = 'GD-2B'  WHERE student_id = 'STU-0008';

-- New students must always choose a class
ALTER TABLE students ALTER COLUMN class_name DROP DEFAULT;
