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
  getUser,
} = require("./controllers/news.controllers");
const { errorHandler, psqlError } = require("./error-handler");
const app = express();
app.use(express.json());

app.route("/api/topics").get(getTopics);
app.route("/api").get(getEnds);
app.route("/api/articles/:article_id").get(getArticle).patch(patchVotes);
app.route("/api/articles").get(getArticles);
app
  .route("/api/articles/:article_id/comments")
  .get(getComments)
  .post(postComment);
app.route("/api/comments/:comment_id").delete(deleteComment);
app.route("/api/users").get(getUsers);
app.route("/api/users/:username").get(getUser);
app.use(errorHandler);
app.use(psqlError);

module.exports = app;
