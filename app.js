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
  patchCommentVotes,
  postArticle,
  postTopic,
  deleteArticle,
} = require("./controllers/news.controllers");
const cors = require("cors");
const { errorHandler, psqlError } = require("./error-handler");
const app = express();
app.use(express.json());
app.use(cors());

app.route("/api/topics").get(getTopics).post(postTopic);
app.route("/api").get(getEnds);
app
  .route("/api/articles/:article_id")
  .get(getArticle)
  .patch(patchVotes)
  .delete(deleteArticle);
app.route("/api/articles").get(getArticles).post(postArticle);
app
  .route("/api/articles/:article_id/comments")
  .get(getComments)
  .post(postComment);
app
  .route("/api/comments/:comment_id")
  .delete(deleteComment)
  .patch(patchCommentVotes);
app.route("/api/users").get(getUsers);
app.route("/api/users/:username").get(getUser);
app.use(errorHandler);
app.use(psqlError);

module.exports = app;
