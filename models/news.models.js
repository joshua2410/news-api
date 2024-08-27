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
