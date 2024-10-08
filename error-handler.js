exports.errorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};
exports.psqlError = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "bad request" });
  } else if (err.code === "42703") {
    res.status(400).send({ msg: "bad request" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "bad request" });
  } else if (err.code === "42601") {
    res.status(400).send({ msg: "bad request" });
  } else if (err.code === "23503") {
    res.status(400).send({ msg: "bad request" });
  } else next(err);
};
