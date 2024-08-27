const { allTopics, allEnds } = require("../models/news.models");

exports.getTopics = (req, res, next) => {
  allTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEnds = (req, res, next) => {
  allEnds()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};
