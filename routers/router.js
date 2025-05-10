const express = require("express");
const mysql = require("mysql2");
const router = express.Router();
const shared = require("./sharedStage");
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
  res.render("home/admin/download.ejs");
});
router.post("/download", (req, res) => {
  res.redirect("/download");
});

module.exports = router;
