const db = require("../db/connection");

exports.allTopics = () => {
  return db.query(`SELECT*FROM topics`).then(({ rows }) => {
    return rows;
  });
};
