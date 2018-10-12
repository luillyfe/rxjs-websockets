const express = require("express");
const parser = require("body-parser");
const Bundler = require("parcel-bundler");

const app = express();
const bundler = new Bundler("src/index.html");


app.use(bundler.middleware());
app.use(parser.json());
// app.use(express.static(`${__dirname}/src`));

module.exports = app;