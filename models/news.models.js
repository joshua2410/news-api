const db = require("../db/connection");
const fs = require("fs/promises");

exports.fetchTopics = () => {
  return db.query(`SELECT*FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchEnds = () => {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((endpoints) => {
      return JSON.parse(endpoints);
    });
};

exports.fetchArticle = (id) => {
  return db
    .query(`SELECT*FROM articles WHERE article_id = $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ msg: "not found", status: 404 });
      return rows;
    });
};

exports.fetchArticles = () => {
  return db
    .query(
      `ALTER TABLE articles ADD comment_count INT; ALTER TABLE articles DROP COLUMN body; UPDATE articles SET comment_count = (SELECT COUNT(comment_id) FROM comments WHERE articles.article_id = comments.article_id); SELECT*FROM articles ORDER BY created_at;`
    )
    .then((rows) => {
      return rows[3].rows;
    });
};
