const express = require("express");
const mysql = require("mysql2");
const teacherRouter = express.Router();
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tajbid01",
  database: "ARG",
});
//all teachers
teacherRouter.get("/teachers", (req, res) => {
  let q = "select * from Teacher;";

  try {
    connection.query(q, (err, teachers) => {
      if (err) throw err;
      teachers.sort((a, b) => a.rank - b.rank);
      res.render("home/teacher/teachersList.ejs", { teachers });
    });
  } catch (error) {
    console.log(error);
  }
});

teacherRouter.get("/teachers/filter", async (req, res) => {
  const { designation } = req.query;
  let q = `SELECT * FROM Teacher WHERE designation ="${designation}";`;

  try {
    connection.query(q, (err, filteredTeachers) => {
      if (err) throw err;
      res.json(filteredTeachers);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

//delete teacher
teacherRouter.delete("/teachers/delete/:id", (req, res) => {
  let id = req.params.id;
  let q = "DELETE FROM Teacher WHERE teacher_id = ?;";
  try {
    connection.query(q, id, (err, _) => {
      if (err) throw err;
      res.redirect("/teachers");
    });
  } catch (error) {
    console.log(error);
  }
});

//route to create new teacher
teacherRouter.get("/teachers/new", (req, res) => {
  res.render("home/teacher/createTeacher.ejs");
});

//create teacher
teacherRouter.post("/teachers", (req, res) => {
  let { name, designation, email } = req.body;
  let q = "INSERT INTO Teacher (name,designation,email) VALUES (?,?,?);";
  try {
    connection.query(q, [name, designation, email], (err, _) => {
      if (err) throw err;
      res.redirect("/teachers");
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = teacherRouter;
