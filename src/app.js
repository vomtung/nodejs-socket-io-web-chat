const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();

// middleware phục vụ file tĩnh
app.use(express.static(path.join(__dirname, "../public")));

// route cơ bản
app.use("/", routes);

module.exports = app;
