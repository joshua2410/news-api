const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

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
          for (const end in response.body.endpoints) {
            expect(typeof response.body.endpoints[end].description).toBe(
              "string"
            );
          }
        });
    });
  });
});
