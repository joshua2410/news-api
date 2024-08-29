const express = require("express");
const {
  getTopics,
  getEnds,
  getArticle,
  getArticles,
  getComments,
  postComment,
  patchVotes,
  deleteComment,
  getUsers,
} = require("./controllers/news.controllers");
const { errorHandler, psqlError } = require("./error-handler");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getEnds);
app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getComments);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchVotes);
app.delete("/api/comments/:comment_id", deleteComment);
app.get("/api/users", getUsers);
app.use(errorHandler);
app.use(psqlError);

module.exports = app;
