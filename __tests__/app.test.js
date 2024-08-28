const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api/topics", () => {
  describe("GET /api/topics", () => {
    it("200: all topics with correct key values", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((response) => {
          expect(response.body.topics.length).toBe(3);
          response.body.topics.forEach((topic) => {
            expect(typeof topic.description).toBe("string");
            expect(typeof topic.slug).toBe("string");
          });
        });
    });
  });
});
describe("/api", () => {
  describe("GET /api", () => {
    it("200: all endpoints with descriptions", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((response) => {
          expect(response.body.endpoints).toEqual(endpoints);
        });
    });
  });
});
describe("/api/articles", () => {
  describe("GET /api/articles/:article_id", () => {
    it("200: article with correct properties", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then((response) => {
          expect(typeof response.body.article[0].author).toBe("string");
          expect(typeof response.body.article[0].title).toBe("string");
          expect(response.body.article[0].article_id).toBe(2);
          expect(typeof response.body.article[0].body).toBe("string");
          expect(typeof response.body.article[0].topic).toBe("string");
          expect(typeof response.body.article[0].created_at).toBe("string");
          expect(typeof response.body.article[0].votes).toBe("number");
          expect(typeof response.body.article[0].article_img_url).toBe(
            "string"
          );
        });
    });
    it("404: article id does not exist", () => {
      return request(app)
        .get("/api/articles/999")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("400: article id is not valid", () => {
      return request(app)
        .get("/api/articles/notanid")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
  describe("GET /api/articles", () => {
    it("200: all articles shown", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length > 0).toBe(true);
          expect(response.body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
          response.body.articles.forEach((article) => {
            expect(typeof article.author).toBe("string");
            expect(typeof article.title).toBe("string");
            expect(typeof article.article_id).toBe("number");
            expect(article.body).toBe(undefined);
            expect(typeof article.topic).toBe("string");
            expect(typeof article.created_at).toBe("string");
            expect(typeof article.votes).toBe("number");
            expect(typeof article.article_img_url).toBe("string");
            expect(typeof article.comment_count).toBe("string");
          });
        });
    });
  });
  describe("GET /api/articles/:article_id/comments", () => {
    it("200: all comments for a specific article", () => {
      return request(app)
        .get("/api/articles/3/comments")
        .expect(200)
        .then((response) => {
          expect(response.body.comments.length).toBe(2);
          response.body.comments.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(typeof comment.article_id).toBe("number");
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
            expect(typeof comment.author).toBe("string");
            expect(typeof comment.body).toBe("string");
          });
        });
    });
    it("200: article id exists but no comments shown", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then((response) => {
          expect(response.body.comments.length).toBe(0);
        });
    });
    it("404: article id does not exist", () => {
      return request(app)
        .get("/api/articles/9000/comments")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("400: article id is invalid", () => {
      return request(app)
        .get("/api/articles/notanumber/comments")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
  describe("POST /api/articles/:article_id/comments", () => {
    it("200: responds with posted comment", () => {
      const comment = {
        username: "TheRockLover9000",
        body: "What an amazing aricle!",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(comment)
        .expect(201)
        .then((response) => {
          expect(response.body.comment.length).toBe(1);
          expect(response.body.comment[0].body).toBe("What an amazing aricle!");
          expect(response.body.comment[0].author).toBe("TheRockLover9000");
          expect(response.body.comment[0].article_id).toBe(2);
          expect(response.body.comment[0].votes).toBe(0);
          expect(response.body.comment[0].comment_id).toBe(19);
          expect(typeof response.body.comment[0].created_at).toBe("string");
        });
    });
    it("400: article id is invalid", () => {
      const comment = {
        username: "TheRockLover9000",
        body: "What an amazing aricle!",
      };
      return request(app)
        .post("/api/articles/notanumber/comments")
        .send(comment)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("404: article id is not found", () => {
      const comment = {
        username: "TheRockLover9000",
        body: "What an amazing aricle!",
      };
      return request(app)
        .post("/api/articles/999/comments")
        .send(comment)
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
  });
  describe("PATCH /api/articles/:article_id", () => {
    it("201: responds with updated article", () => {
      const update = { inc_votes: 22 };
      return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(201)
        .then((response) => {
          expect(response.body.article[0].article_id).toBe(1);
          expect(response.body.article[0].votes).toBe(122);
          expect(response.body.article[0].title).toBe(
            "Living in the shadow of a great man"
          );
        });
    });
    it("404: article id is not found", () => {
      const update = { inc_votes: 22 };
      return request(app)
        .patch("/api/articles/999")
        .send(update)
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("400: article id is invalid", () => {
      const update = { inc_votes: 22 };
      return request(app)
        .patch("/api/articles/notanid")
        .send(update)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("400: invalid patch", () => {
      const update = { inc_votes: "notanumber" };
      return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
});
