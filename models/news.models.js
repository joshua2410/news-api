const db = require("../db/connection");
const fs = require("fs/promises");
const format = require("pg-format");
const { checkCategoryExists } = require("../db/seeds/utils");

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
    .query(
      `SELECT articles.article_id, articles.author, articles.body, articles.title, articles.topic,articles.created_at,articles.votes,articles.article_img_url, COUNT(comment_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ msg: "not found", status: 404 });
      else return rows[0];
    });
};

exports.fetchArticles = (sort_by, order, topic, limit, p) => {
  let page = 0;
  let queryStr = `SELECT articles.article_id, articles.author, articles.title, articles.topic,articles.created_at,articles.votes,articles.article_img_url, COUNT(comment_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`;
  const queryVals = [];
  if (topic) {
    return checkCategoryExists("topics", "slug", topic).then(() => {
      queryStr += ` WHERE topic = $1 GROUP BY articles.article_id`;
      queryVals.push(topic);
      if (sort_by && order) {
        queryStr += ` ORDER BY ${sort_by} ${order}`;
      } else if (order) {
        queryStr += ` ORDER BY created_at ${order}`;
      } else if (sort_by) {
        queryStr += ` ORDER BY ${sort_by} DESC`;
      } else {
        queryStr += ` ORDER BY created_at DESC`;
      }
      if (limit && p) {
        const page = limit * p - limit;
        queryStr += ` LIMIT ${limit} OFFSET ${page};`;
      } else if (limit) {
        queryStr += ` LIMIT ${limit};`;
      } else if (p) {
        const limit = 10;
        const page = limit * p - limit;
        queryStr += ` LIMIT 10 OFFSET ${page};`;
      } else {
        queryStr += ` LIMIT 10;`;
      }

      return db.query(queryStr, queryVals).then(({ rows }) => {
        return rows;
      });
    });
  } else {
    queryStr += ` GROUP BY articles.article_id`;
  }
  if (sort_by && order) {
    queryStr += ` ORDER BY ${sort_by} ${order}`;
  } else if (order) {
    queryStr += ` ORDER BY created_at ${order}`;
  } else if (sort_by) {
    queryStr += ` ORDER BY ${sort_by} DESC`;
  } else {
    queryStr += ` ORDER BY created_at DESC`;
  }
  if (limit && p) {
    const page = limit * p - limit;
    queryStr += ` LIMIT ${limit} OFFSET ${page};`;
  } else if (limit) {
    queryStr += ` LIMIT ${limit};`;
  } else if (p) {
    const limit = 10;
    const page = limit * p - limit;
    queryStr += ` LIMIT 10 OFFSET ${page};`;
  } else {
    queryStr += ` LIMIT 10;`;
  }
  return db.query(queryStr, queryVals).then(({ rows }) => {
    if (rows.length === 0)
      return Promise.reject({ status: 404, msg: "not found" });
    rows.total_count = rows.length;
    return rows;
  });
};

exports.fetchComments = (id, limit, p) => {
  return this.fetchArticle(id).then(() => {
    let queryStr = `SELECT*FROM comments WHERE article_id = $1`;
    if (limit && p) {
      const page = limit * p - limit;
      queryStr += ` LIMIT ${limit} OFFSET ${page};`;
    } else if (limit) {
      queryStr += ` LIMIT ${limit};`;
    } else if (p) {
      const limit = 10;
      const page = limit * p - limit;
      queryStr += ` LIMIT 10 OFFSET ${page};`;
    } else {
      queryStr += ` LIMIT 10;`;
    }
    return db.query(queryStr, [id]).then(({ rows }) => {
      return rows;
    });
  });
};

exports.sendComment = (data, id) => {
  return this.fetchArticle(id).then(() => {
    const { username, body } = data;
    return checkCategoryExists("users", "username", username).then(() => {
      return db
        .query(
          `INSERT INTO comments ( author, body, article_id) VALUES ($1,$2,$3) RETURNING*;`,
          [username, body, id]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    });
  });
};

exports.updateVotes = (data, id) => {
  const { inc_votes } = data;
  return db
    .query(
      `UPDATE articles SET votes = votes+ $1 WHERE article_id = $2 RETURNING*`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "not found" });
      else return rows[0];
    });
};

exports.commentToDelete = (id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING*`, [id])
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "not found" });
    });
};

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchUser = (id) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "not found" });
      return rows[0];
    });
};

exports.updateCommentVotes = (data, id) => {
  const { inc_votes } = data;
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING*`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "not found" });
      else return rows[0];
    });
};

exports.sendArticle = (data) => {
  const { title, topic, author, body } = data;
  return db
    .query(
      `INSERT INTO articles (title, topic, author, body) VALUES($1, $2, $3, $4) RETURNING*`,
      [title, topic, author, body]
    )
    .then(({ rows }) => {
      return db
        .query(
          `SELECT articles.article_id, articles.author, articles.body, articles.title, articles.topic,articles.created_at,articles.votes,articles.article_img_url, COUNT(comment_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;`,
          [rows[0].article_id]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    });
};

exports.sendTopic = (data) => {
  const { slug, description } = data;
  return db
    .query(`INSERT INTO topics (slug, description) VALUES($1,$2) RETURNING*`, [
      slug,
      description,
    ])
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.articleToDelete = (id) => {
  return db
    .query(`DELETE FROM articles WHERE article_id = $1 RETURNING*`, [id])
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "not found" });
      return db
        .query(`DELETE FROM articles WHERE article_id = $1 RETURNING*`, [id])
        .then(({ rows }) => {});
    });
};
