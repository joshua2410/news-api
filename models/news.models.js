const db = require("../db/connection");
const fs = require("fs/promises");
const { checkCategoryExists } = require("../db/seeds/utils");
const format = require("pg-format");

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
      else return rows;
    });
};

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT articles.article_id, articles.author, articles.title, articles.topic,articles.created_at,articles.votes,articles.article_img_url, COUNT(comment_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchComments = (id) => {
  return this.fetchArticle(id).then(() => {
    return db
      .query(`SELECT*FROM comments WHERE article_id = $1`, [id])
      .then(({ rows }) => {
        return rows;
      });
  });
};

exports.sendComment = (data, id) => {
  return this.fetchArticle(id).then(() => {
    const { username, body } = data;
    const name = "unknown";
    return db
      .query(`INSERT INTO users (username, name) VALUES ($1,$2) RETURNING*;`, [
        username,
        name,
      ])
      .then(() => {
        return db
          .query(
            `INSERT INTO comments ( author, body, article_id) VALUES ($1,$2,$3) RETURNING*;`,
            [username, body, id]
          )
          .then(({ rows }) => {
            return rows;
          });
      });
  });
};
