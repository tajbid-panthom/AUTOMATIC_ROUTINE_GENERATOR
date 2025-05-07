const express = require("express");
const mysql = require("mysql2");
const courseRouter = express.Router();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tajbid01",
  database: "ARG",
});

//course list
courseRouter.get("/coursesList", async (req, res) => {
  let q = `select course_id,course_title,course_code,credit,year,term from Course;`;
  try {
    connection.query(q, (err, courses) => {
      if (err) throw err;
      res.render("home/courses/coursesList.ejs", { courses });
    });
  } catch (error) {
    console.log(error);
  }
});
courseRouter.get("/courses/filter", async (req, res) => {
  const { year, term } = req.query;
  let q;
  if (!year && !term) {
    res.redirect("/coursesList");
  } else if (year && !term) {
    q = `SELECT * FROM Course WHERE year ="${year}";`;
  } else {
    q = `SELECT * FROM Course WHERE year ="${year}"  AND term = "${term}";`;
  }

  try {
    connection.query(q, (err, filteredCourses) => {
      if (err) throw err;
      res.json(filteredCourses);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//route to add course
courseRouter.get("/courses/new", (req, res) => {
  res.render("home/courses/createCourse.ejs");
});

//create course

courseRouter.post("/add-course", (req, res) => {
  const { course_title, course_code, credit, year, term } = req.body;
  let q = `INSERT INTO Course (course_title,course_code,credit,year,term ) VALUES (?,?,?,?,?);`;

  try {
    connection.query(
      q,
      [course_title, course_code, credit, year, term],
      (err, course) => {
        if (err) throw err;
        res.redirect("/coursesList");
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//delete course
courseRouter.delete("/courses/delete/:id", (req, res) => {
  let id = req.params.id;
  let q = `delete from Course where course_id = "${id}";`;
  try {
    connection.query(q, (err, _) => {
      if (err) throw err;
      res.redirect("/coursesList");
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = courseRouter;
