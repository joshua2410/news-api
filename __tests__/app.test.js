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
          expect(response.body.articles).toBeSortedBy("created_at");
          response.body.articles.forEach((article) => {
            expect(typeof article.author).toBe("string");
            expect(typeof article.title).toBe("string");
            expect(typeof article.article_id).toBe("number");
            expect(article.body).toBe(undefined);
            expect(typeof article.topic).toBe("string");
            expect(typeof article.created_at).toBe("string");
            expect(typeof article.votes).toBe("number");
            expect(typeof article.article_img_url).toBe("string");
            expect(typeof article.comment_count).toBe("number");
          });
        });
    });
  });
});
