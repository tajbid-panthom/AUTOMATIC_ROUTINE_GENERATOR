const express = require("express");
const mysql = require("mysql2");
const router = express.Router();
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tajbid01",
  database: "ARG",
});

router.get("/", (req, res) => {
  res.render("home/admin/index.ejs");
});
router.get("/create-routine", (req, res) => {
  res.render("home/admin/initialize.ejs");
});

router.get("/assigned-teachers-list", (req, res) => {
  res.render("home/admin/assignedTeachersList.ejs");
});
router.post("/assigned-teachers-list", (req, res) => {
  res.redirect("/assigned-teachers-list");
});

router.get("/admin/login", (req, res) => {
  res.render("home/admin/login.ejs");
});
router.get("/add-time", (req, res) => {
  res.render("home/admin/addPreferredTime.ejs");
});
router.post("/add-time", (req, res) => {
  res.redirect("/add-time");
});
router.post("/assigned-teachers", (req, res) => {
  res.render("home/admin/assignedTeacher.ejs");
});
router.post("/assigning-teacher", (req, res) => {
  res.redirect("/course-credit");
});
router.post("/course-credit", (req, res) => {
  res.redirect("/course-credit");
});
router.get("/course-credit", (req, res) => {
  res.render("home/admin/course&credit.ejs");
});
router.get("/download", (req, res) => {
  res.render("home/admin/download.ejs");
});
router.post("/download", (req, res) => {
  res.redirect("/download");
});
router.get("/show-time", (req, res) => {
  res.render("home/admin/showtimes.ejs");
});
router.post("/add-preferred-time", (req, res) => {
  res.redirect("/show-time");
});
module.exports = router;
