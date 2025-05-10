const express = require("express");
const mysql = require("mysql2");
const assigningRouter = express.Router();
const shared = require("./sharedStage");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tajbid01",
  database: "ARG",
});

assigningRouter.use((_, res, next) => {
  res.locals.years_terms = shared.years_terms;
  next();
});

//route to the assign page
assigningRouter.post("/assign-teachers", (req, res) => {
  let { year1_terms, year2_terms, year3_terms, year4_terms, masters_terms } =
    req.body;
  if (year1_terms[year1_terms.length - 1] === "none") {
    year1_terms.pop();
  }
  if (year2_terms[year2_terms.length - 1] === "none") {
    year2_terms.pop();
  }
  if (year3_terms[year3_terms.length - 1] === "none") {
    year3_terms.pop();
  }
  if (year4_terms[year4_terms.length - 1] === "none") {
    year4_terms.pop();
  }
  if (masters_terms[masters_terms.length - 1] === "none") {
    masters_terms.pop();
  }

  let years_terms = {
    1: year1_terms,
    2: year2_terms,
    3: year3_terms,
    4: year4_terms,
    5: masters_terms,
  };
  for (let key in years_terms) {
    const arr = years_terms[key];
    if (!Array.isArray(arr) || arr.length === 0) {
      delete years_terms[key];
    }
  }
  let len = Object.values(years_terms).flat().length;

  let term = null;
  let year = null;
  for (let key of Object.keys(years_terms)) {
    for (let value of years_terms[key]) {
      term = value;
      year = key;
      break;
    }
    break;
  }

  shared.years_terms = years_terms;
  let qc = `select * from Course where year = ${year} and term = '${term}';`;
  let qt = `select * from Teacher;`;
  try {
    connection.query(qc, (err1, courses) => {
      if (err1) throw err1;
      try {
        connection.query(qt, (err2, teachers) => {
          if (err2) throw err2;
          res.render("home/assigning/assignedTeacher.ejs", {
            courses,
            teachers,
            year,
            term,
            course_len: len,
          });
        });
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//loop of assinging teacher
assigningRouter.get("/assign-teachers", (req, res) => {
  years_terms = shared.years_terms;

  let term = null;
  let year = null;
  for (let key of Object.keys(years_terms)) {
    years_terms[key].shift();
    break;
  }
  let len = Object.values(years_terms).flat().length;

  for (let key of Object.keys(years_terms)) {
    const arr = years_terms[key];

    if (!Array.isArray(arr) || arr.length === 0) {
      delete years_terms[key];
      continue;
    }

    for (let value of years_terms[key]) {
      term = value;
      year = key;
      break;
    }

    if (arr.length === 0) {
      delete years_terms[key];
    }

    break;
  }
  shared.years_terms = years_terms;
  let qc = `select * from Course where year = ${year} and term = '${term}';`;
  let qt = `select * from Teacher;`;
  try {
    connection.query(qc, (err1, courses) => {
      if (err1) throw err1;
      try {
        connection.query(qt, (err2, teachers) => {
          if (err2) throw err2;

          res.render("home/assigning/assignedTeacher.ejs", {
            courses,
            teachers,
            year,
            term,
            course_len: len,
          });
        });
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//to list of assigned teacher

assigningRouter.get("/assigned-teachers-list", (req, res) => {
  let q = `SELECT DISTINCT T.teacher_id, T.name, T.designation, T.email
FROM Teacher_Courses T_C
JOIN Teacher T ON T.teacher_id = T_C.teacher_id
WHERE T.teacher_id NOT IN (
  SELECT teacher_id FROM Preferred_Time
);`;
  let q2 = `SELECT DISTINCT T.teacher_id, T.name, T.designation, T.email
FROM Teacher_Courses T_C
JOIN Teacher T ON T.teacher_id = T_C.teacher_id
WHERE T.teacher_id IN (
  SELECT teacher_id FROM Preferred_Time
);`;
  let submit = 0;
  try {
    connection.query(q, (err, teacher_courses) => {
      if (err) throw err;
      if (teacher_courses.length === 0) {
        submit = 1;
      }
      try {
        connection.query(q2, (err2, teacher_courses2) =>
          res.render("home/assigning/assignedTeachersList.ejs", {
            teacher_courses,
            teacher_courses2,
            submit,
          })
        );
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//to list of assigned teacher
assigningRouter.post("/assigned-teachers-list", (req, res) => {
  const courseAssignments = req.body.courses;
  let q;
  courseAssignments.forEach(({ course_id, teacher_id }) => {
    q = `insert into Teacher_Courses (teacher_id,course_id) values ("${teacher_id}","${course_id}");`;
    try {
      connection.query(q, (err, _) => {
        if (err) throw err;
      });
    } catch (error) {
      console.log(error);
    }
  });
  res.redirect("/assigned-teachers-list");
});

//
assigningRouter.post("/assign-teacher", (req, res) => {
  const courseAssignments = req.body.courses;
  let q;
  courseAssignments.forEach(({ course_id, teacher_id }) => {
    q = `insert into Teacher_Courses (teacher_id,course_id) values ("${teacher_id}","${course_id}");`;
    try {
      connection.query(q, (err, _) => {
        if (err) throw err;
      });
    } catch (error) {
      console.log(error);
    }
  });
  res.redirect("/assign-teachers");
});

module.exports = assigningRouter;
