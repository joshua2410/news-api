const { sort } = require("../db/data/test-data/articles");
const {
  fetchArticles,
  fetchTopics,
  fetchEnds,
  fetchArticle,
  fetchComments,
  sendComment,
  updateVotes,
  commentToDelete,
  fetchUsers,
  fetchUser,
  updateCommentVotes,
  sendArticle,
} = require("../models/news.models");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEnds = (req, res, next) => {
  fetchEnds()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, limit, p } = req.query;
  fetchArticles(sort_by, order, topic, limit, p)
    .then((articles) => {
      const total_count = articles.length;
      res.status(200).send({ articles, total_count });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  fetchComments(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  sendComment(body, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  updateVotes(body, article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  commentToDelete(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUser = (req, res, next) => {
  const { username } = req.params;
  fetchUser(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentVotes = (req, res, next) => {
  const { comment_id } = req.params;
  const { body } = req;
  updateCommentVotes(body, comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const { body } = req;
  sendArticle(body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
