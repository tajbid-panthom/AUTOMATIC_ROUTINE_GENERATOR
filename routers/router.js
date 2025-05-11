const express = require("express");
const mysql = require("mysql2");
const router = express.Router();
const shared = require("./sharedStage");
const { PythonShell } = require("python-shell");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tajbid01",
  database: "ARG",
});
router.use((_, res, next) => {
  res.locals.course_len = shared.course_len;
  res.locals.years_terms = shared.years_terms;
  next();
});

router.get("/", (req, res) => {
  res.render("home/admin/index.ejs");
});
router.get("/create-routine", (req, res) => {
  res.render("home/admin/initialize.ejs");
});

router.get("/admin/login", (req, res) => {
  res.render("home/admin/login.ejs");
});

router.post("/assigning-teacher", (req, res) => {
  res.redirect("/course-credit");
});

router.get("/download", (req, res) => {
  const q = `SELECT C.course_code, C.credit, C.year, C.term, T.name
             FROM Course C
             JOIN Teacher_Courses TC ON C.course_id = TC.course_id
             JOIN Teacher T ON TC.teacher_id = T.teacher_id;`;
  const q2 = "SELECT name, `rank` FROM Teacher;";
  const q3 = `SELECT T.name, P.start_time, P.end_time, P.day
              FROM Preferred_Time P
              JOIN Teacher T ON P.teacher_id = T.teacher_id;`;
  const q4 = `select year from YearTerm;`;

  // Step 1: Query all 3 datasets in parallel
  try {
    connection.query(q, (err1, courses) => {
      if (err1) throw err1;

      connection.query(q2, (err2, teachers) => {
        if (err2) throw err2;

        connection.query(q3, (err3, preferredTimes) => {
          if (err3) throw err3;

          connection.query(q4, (err4, years) => {
            if (err4) throw err4;
            const allData = {
              courses,
              teachers,
              preferredTimes,
              years,
            };

            const options = {
              mode: "text",
              pythonOptions: ["-u"],
              scriptPath:
                "/Users/mdtajbidhossainbappi/Documents/SOFTWARE B/Real Time project/AUTOMATIC_ROUTINE_GENERATOR/routers",
              args: [JSON.stringify(allData)],
            };

            PythonShell.run("test2.py", options)
              .then((messages) => {
                res.render("home/admin/download.ejs");
                console.log(messages[0]);
              })
              .catch((error) => {
                console.error("Python error:", error);
              });
          });
          // Step 2: Send ALL data to Python script
        });
      });
    });
  } catch (error) {
    console.error(error);
  }
});
router.get("/show-routine", (req, res) => {
  let q1 = `delete from Preferred_Time;`;
  let q2 = `delete from Teacher_Courses;`;
  let q3 = `delete from YearTerm;`;
  try {
    connection.query(q1, (err1, _) => {
      if (err1) throw err1;
      connection.query(q2, (err2, _) => {
        if (err2) throw err2;
        connection.query(q3, (err3, _) => {
          if (err3) throw err3;
          res.render("home/admin/showTable.ejs");
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
