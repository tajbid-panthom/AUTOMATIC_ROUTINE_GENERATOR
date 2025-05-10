const express = require("express");
const mysql = require("mysql2");
const creditTimeRouter = express.Router();
const shared = require("./sharedStage");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tajbid01",
  database: "ARG",
});
creditTimeRouter.post("/course-credit/:id", (req, res) => {
  let { id } = req.params;
  res.redirect(`/course-credit/${id}`);
});
creditTimeRouter.get("/course-credit/:id", (req, res) => {
  let { id } = req.params;
  let q = `select T.name,T.teacher_id,C.course_title,C.course_code,C.credit,C.isSessional from Teacher T , Teacher_Courses T_C , Course C where T.teacher_id = "${id}" and T.teacher_id= T_C.teacher_id and T_C.course_id = C.course_id ;`;

  try {
    connection.query(q, (err, teacherCourses) => {
      if (err) throw err;
      res.render("home/course&time/course&credit.ejs", {
        teacherCourses,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

creditTimeRouter.get("/add-time/:id", (req, res) => {
  let { id } = req.params;
  let q = `select name,teacher_id from Teacher where teacher_id = "${id}"`;
  try {
    connection.query(q, (err, teachers) => {
      if (err) throw err;
      res.render("home/course&time/addPreferredTime.ejs", {
        teacher: teachers[0],
      });
    });
  } catch (error) {
    console.log(error);
  }
});

creditTimeRouter.post("/add-time/:id", (req, res) => {
  let { id } = req.params;
  res.redirect(`/add-time/${id}`);
});

creditTimeRouter.post("/add-preferred-time", (req, res) => {
  let { teacher_id, day, start_time, end_time } = req.body;
  let q = `insert into Preferred_Time (teacher_id,day, start_time, end_time) values ('${teacher_id}','${day}','${start_time}','${end_time}')`;
  try {
    connection.query(q, (err, _) => {
      if (err) throw err;
      res.redirect(`/show-time/${teacher_id}`);
    });
  } catch (error) {
    console.log(error);
  }
});

creditTimeRouter.get("/show-time/:id", (req, res) => {
  let { id } = req.params;
  let q = `select T.name,T.teacher_id,C.course_title,C.course_code,C.credit,C.isSessional from Teacher T , Teacher_Courses T_C , Course C where T.teacher_id = "${id}" and T.teacher_id= T_C.teacher_id and T_C.course_id = C.course_id ;`;
  let q2 = `select * from Preferred_Time where teacher_id='${id}'`;
  try {
    connection.query(q, (err, teacherCourses) => {
      if (err) throw err;
      try {
        connection.query(q2, (err2, times) => {
          if (err2) throw err2;
          res.render("home/course&time/showtimes.ejs", {
            teacherCourses,
            times,
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

creditTimeRouter.delete("/preferred-time/delete/:id", (req, res) => {
  let { id } = req.params;
  let q2 = `select teacher_id from Preferred_Time where preferred_time_id = '${id}';`;
  let q = `delete from Preferred_Time where preferred_time_id = '${id}';`;
  try {
    connection.query(q2, (err, teacher) => {
      if (err) throw err;
      try {
        connection.query(q, (err2, _) => {
          if (err) throw err;
          res.redirect(`/show-time/${teacher[0].teacher_id}`);
        });
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = creditTimeRouter;
