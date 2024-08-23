const { allTopics } = require("../models/news.models");

exports.getTopics = (req, res, next) => {
  allTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
