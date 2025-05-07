CREATE TABLE Course (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_title VARCHAR(100),
    course_code VARCHAR(20) NOT NULL,
    credit DECIMAL(3,1),
    year INT,
    term VARCHAR(10),
    isSessional BOOLEAN GENERATED ALWAYS AS (
        RIGHT(course_code, 1) IN ('0', '2', '4', '6', '8')
    ) STORED
)engine=InnoDB;

CREATE TABLE Teacher (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    designation ENUM('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer') NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    assigned_credit DECIMAL(4,1) DEFAULT 0.0,
    password VARCHAR(255) NOT NULL DEFAULT "tajbid",

    `rank` INT GENERATED ALWAYS AS (
        CASE designation
            WHEN 'Professor' THEN 1
            WHEN 'Associate Professor' THEN 2
            WHEN 'Assistant Professor' THEN 3
            WHEN 'Lecturer' THEN 4
            ELSE NULL
        END
    ) STORED,

    CHECK (assigned_credit >= 0)
) ENGINE = InnoDB;
