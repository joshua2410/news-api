const express = require("express");
const { getTopics, getEnds } = require("./controllers/news.controllers");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getEnds);

module.exports = app;
