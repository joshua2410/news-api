const express = require("express");
const {
  getTopics,
  getEnds,
  getArticle,
  getArticles,
} = require("./controllers/news.controllers");
const { errorHandler, psqlError } = require("./error-handler");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getEnds);
app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles", getArticles);
app.use(errorHandler);
app.use(psqlError);

module.exports = app;
