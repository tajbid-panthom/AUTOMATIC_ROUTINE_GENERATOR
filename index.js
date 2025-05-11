const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const router = require("./routers/router.js");
const courseRouter = require("./routers/courseRouter.js");
const teacherRouter = require("./routers/teacherRouter.js");
const { assigningRouter } = require("./routers/assigningRouter.js");
const creditTimeRouter = require("./routers/creditTimeRouter.js");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static("public"));
app.engine("ejs", ejsMate);

app.use(router);
app.use(courseRouter);
app.use(teacherRouter);
app.use(assigningRouter);
app.use(creditTimeRouter);

const port = process.env.PORT || 8080;
app.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
});
