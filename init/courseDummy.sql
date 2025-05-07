INSERT INTO Course (course_title, course_code, credit, year, term)
VALUES 
-- Year 1
('Introduction to Programming', 'CSE110', 3.0, 1, '1st'),   -- 0 → sessional
('Discrete Mathematics', 'MAT111', 3.0, 1, '2nd'),           -- 1 → not sessional
('Digital Logic Design', 'EEE112', 3.0, 1, '3rd'),           -- 2 → sessional

-- Year 2
('Data Structures', 'CSE220', 3.0, 2, '1st'),                -- 0 → sessional
('Object-Oriented Programming', 'CSE221', 3.0, 2, '2nd'),    -- 1 → not sessional
('Microprocessors', 'EEE222', 3.0, 2, '3rd'),                -- 2 → sessional

-- Year 3
('Database Systems', 'CSE330', 3.0, 3, '1st'),               -- 0 → sessional
('Operating Systems', 'CSE331', 3.0, 3, '2nd'),              -- 1 → not sessional
('Computer Networks', 'CSE340', 3.0, 3, '3rd'),              -- 0 → sessional

-- Year 4
('Software Engineering', 'CSE410', 3.0, 4, '1st'),           -- 0 → sessional
('Machine Learning', 'CSE471', 3.0, 4, '2nd'),               -- 1 → not sessional
('Artificial Intelligence', 'CSE472', 3.0, 4, '3rd'),        -- 2 → sessional

-- Master's
('Advanced Machine Learning', 'CSE510', 3.0, 5, '1st'),      -- 0 → sessional
('Cloud Computing', 'CSE511', 3.0, 5, '2nd'),                -- 1 → not sessional
('Quantum Computing', 'CSE512', 3.0, 5, '3rd');              -- 2 → sessional
