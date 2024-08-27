const db = require("../db/connection");
const fs = require("fs/promises");

exports.allTopics = () => {
  return db.query(`SELECT*FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.allEnds = () => {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((endpoints) => {
      return JSON.parse(endpoints);
    });
};

exports.oneArticle = (id) => {
  return db
    .query(`SELECT*FROM articles WHERE article_id = $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ msg: "not found", status: 404 });
      return rows;
    });
};
