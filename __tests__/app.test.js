const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");
const { checkCategoryExists } = require("../db/seeds/utils");
const articles = require("../db/data/test-data/articles");
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
  describe("POST /api/topics", () => {
    it("201: returns with posted topic", () => {
      const topicToPost = {
        slug: "swimming",
        description: "best olympic sport",
      };
      return request(app)
        .post("/api/topics")
        .send(topicToPost)
        .expect(201)
        .then((response) => {
          expect(response.body.topic).toMatchObject(topicToPost);
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
          expect(typeof response.body.article.author).toBe("string");
          expect(typeof response.body.article.title).toBe("string");
          expect(response.body.article.article_id).toBe(2);
          expect(typeof response.body.article.body).toBe("string");
          expect(typeof response.body.article.topic).toBe("string");
          expect(typeof response.body.article.created_at).toBe("string");
          expect(typeof response.body.article.votes).toBe("number");
          expect(typeof response.body.article.article_img_url).toBe("string");
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
    it("200: article id also contains comment count", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((response) => {
          expect(response.body.article.comment_count).toBe("11");
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
    it("200: all comments for a specific article with limit and p queries", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=3&p1")
        .expect(200)
        .then((response) => {
          expect(response.body.comments.length).toBe(3);
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
    it("400: invalid limit query", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=notanumber&p=1")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("400: invalid p query", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=4&p=jeff")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
  describe("POST /api/articles/:article_id/comments", () => {
    it("200: responds with posted comment", () => {
      const comment = {
        username: "butter_bridge",
        body: "What an amazing article!",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(comment)
        .expect(201)
        .then((response) => {
          expect(response.body.comment.body).toBe("What an amazing article!");
          expect(response.body.comment.author).toBe("butter_bridge");
          expect(response.body.comment.article_id).toBe(2);
          expect(response.body.comment.votes).toBe(0);
          expect(response.body.comment.comment_id).toBe(19);
          expect(typeof response.body.comment.created_at).toBe("string");
        });
    });
    it("200: responds with posted comment when given more keys", () => {
      const comment = {
        username: "butter_bridge",
        body: "Wow that was great",
        notakey: "Skibidi",
      };
      return request(app)
        .post("/api/articles/4/comments")
        .send(comment)
        .expect(201)
        .then((response) => {
          expect(response.body.comment.body).toBe("Wow that was great");
          expect(response.body.comment.author).toBe("butter_bridge");
          expect(response.body.comment.article_id).toBe(4);
          expect(response.body.comment.votes).toBe(0);
          expect(response.body.comment.comment_id).toBe(19);
          expect(typeof response.body.comment.created_at).toBe("string");
        });
    });
    it("400: article id is invalid", () => {
      const comment = {
        username: "butter_bridge",
        body: "What an amazing article!",
      };
      return request(app)
        .post("/api/articles/notanumber/comments")
        .send(comment)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("400: invalid post", () => {
      const comment = {
        username: "butter_bridge",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(comment)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("404: article id is not found", () => {
      const comment = {
        username: "butter_bridge",
        body: "What an amazing article!",
      };
      return request(app)
        .post("/api/articles/999/comments")
        .send(comment)
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("404: username not found", () => {
      const comment = {
        username: "therocklover9000",
        body: "needs more tequila",
      };
      return request(app)
        .post("/api/articles/6/comments")
        .send(comment)
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
  });
  describe("PATCH /api/articles/:article_id", () => {
    it("200: responds with updated article", () => {
      const update = { inc_votes: 22 };
      return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(200)
        .then((response) => {
          expect(response.body.article.article_id).toBe(1);
          expect(response.body.article.votes).toBe(122);
          expect(response.body.article.title).toBe(
            "Living in the shadow of a great man"
          );
        });
    });
    it("200: responds with updated article when given more keys", () => {
      const update = { inc_votes: 22, shouldnotexist: 6000 };
      return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(200)
        .then((response) => {
          expect(response.body.article.article_id).toBe(1);
          expect(response.body.article.votes).toBe(122);
          expect(response.body.article.title).toBe(
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
  describe("GET /api/articles? sort_by & order", () => {
    it("200: when using sort_by query with order", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=ASC")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length > 0).toBe(true);
          expect(response.body.articles).toBeSortedBy("article_id");
        });
    });
    it("200: when using order with no sort_by query", () => {
      return request(app)
        .get("/api/articles?order=ASC")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length > 0).toBe(true);
          expect(response.body.articles).toBeSortedBy("created_at");
        });
    });
    it("200: when using no sort_by with no order query", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length > 0).toBe(true);
          expect(response.body.articles).toBeSortedBy("article_id", {
            descending: true,
          });
        });
    });
    it("400: using an invalid query request", () => {
      return request(app)
        .get("/api/articles?order=notanorder")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
  describe("/api/articles?topic=", () => {
    it("200: returns all articles with queried topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length > 0).toBe(true);
          expect(response.body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
          response.body.articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    it("200: returns all articles with queried topic and sort by", () => {
      return request(app)
        .get("/api/articles?topic=mitch&sort_by=author")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length > 0).toBe(true);
          expect(response.body.articles).toBeSortedBy("author", {
            descending: true,
          });
          response.body.articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    it("200: returns all articles with queried topic and sort by and order", () => {
      return request(app)
        .get("/api/articles?topic=cats&sort_by=author&order=ASC")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length > 0).toBe(true);
          expect(response.body.articles).toBeSortedBy("article_id");
          response.body.articles.forEach((article) => {
            expect(article.topic).toBe("cats");
          });
        });
    });
    it("404: not found when filtering an invalid topic", () => {
      return request(app)
        .get("/api/articles?topic=invalidquery")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("200: when filtering correct topic but no corresponding articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(0);
        });
    });
  });
  describe("POST /api/articles", () => {
    it("201: responds with newly posted article", () => {
      const newArticle = {
        title: "papyrus",
        topic: "paper",
        author: "icellusedkars",
        body: "Egyptian paper given to them by Osiris",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then((response) => {
          expect(response.body.article.title).toBe("papyrus");
          expect(response.body.article.topic).toBe("paper");
          expect(response.body.article.author).toBe("icellusedkars");
          expect(response.body.article.body).toBe(
            "Egyptian paper given to them by Osiris"
          );
          expect(response.body.article.votes).toBe(0);
          expect(typeof response.body.article.created_at).toBe("string");
          expect(typeof response.body.article.article_img_url).toBe("string");
          expect(response.body.article.article_id).toBe(14);
          expect(response.body.article.comment_count).toBe("0");
        });
    });
    it("400: bad request when missing author not in usernames", () => {
      const newArticle = {
        title: "papyrus",
        topic: "paper",
        author: "jeff",
        body: "Egyptian paper given to them by Osiris",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("400: bad request when keys have invalid characters", () => {
      const newArticle = {
        title: 9,
        topic: "paper",
        author: "jeff",
        body: "Egyptian paper given to them by Osiris",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("201: responds with newly posted article if given extra keys", () => {
      const newArticle = {
        title: "papyrus",
        topic: "paper",
        author: "icellusedkars",
        body: "Egyptian paper given to them by Osiris",
        shouldnotexist: "no",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then((response) => {
          expect(response.body.article.title).toBe("papyrus");
          expect(response.body.article.topic).toBe("paper");
          expect(response.body.article.author).toBe("icellusedkars");
          expect(response.body.article.body).toBe(
            "Egyptian paper given to them by Osiris"
          );
          expect(response.body.article.votes).toBe(0);
          expect(typeof response.body.article.created_at).toBe("string");
          expect(typeof response.body.article.article_img_url).toBe("string");
          expect(response.body.article.article_id).toBe(14);
          expect(response.body.article.comment_count).toBe("0");
        });
    });
  });
  describe("GET /api/articles?limit&p", () => {
    it("200; responds with correct page and number of items per page", () => {
      return request(app)
        .get("/api/articles?limit=5&p=2")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(5);
          expect(response.body.total_count).toBe(5);
        });
    });
    it("200; responds with correct page and number of items per page when using all queries", () => {
      return request(app)
        .get(
          "/api/articles?limit=5&p=2&sort_by=article_id&order=ASC&topic=mitch"
        )
        .expect(200)
        .then((response) => {
          expect(response.body.articles).toBeSortedBy("article_id");
          expect(response.body.articles.length).toBe(5);
          expect(response.body.total_count).toBe(5);
          response.body.articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    it("404: not found when no results", () => {
      return request(app)
        .get("/api/articles?limit=12&p=4")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("400: bad request with invalid limit", () => {
      return request(app)
        .get("/api/articles?limit=hello&p=4")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("400: bad request with invalid p", () => {
      return request(app)
        .get("/api/articles?limit=2&p=hello")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
  describe("DELETE /api/articles/:article_id", () => {
    it("204 responds with nothing", () => {
      return request(app).delete("/api/articles/4").expect(204);
    });
    it("404 not found", () => {
      return request(app)
        .delete("/api/articles/1000")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("400 bad request", () => {
      return request(app)
        .delete("/api/articles/notfound")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
});

describe("/api/comments", () => {
  describe("DELETE /api/comments/:comment_id", () => {
    it("204: responds with nothing and deletes comment", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
    it("404: responds with not found when no comment", () => {
      return request(app)
        .delete("/api/comments/666")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("400: responds with bad request for invalid id", () => {
      return request(app)
        .delete("/api/comments/notanid")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
  describe("PATCH /api/comments/:comment_id", () => {
    it("200: responds with updated comment", () => {
      const updateVotes = { inc_votes: 201 };
      return request(app)
        .patch("/api/comments/2")
        .send(updateVotes)
        .expect(200)
        .then((response) => {
          expect(response.body.comment.votes).toBe(215);
          expect(response.body.comment.body).toBe(
            "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky."
          );
          expect(response.body.comment.author).toBe("butter_bridge");
          expect(response.body.comment.article_id).toBe(1);
        });
    });
    it("404: comment id is not found", () => {
      const update = { inc_votes: 400 };
      return request(app)
        .patch("/api/comments/9999")
        .send(update)
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    it("400: comment id invalid", () => {
      const update = { inc_votes: 6060 };
      return request(app)
        .patch("/api/comments/notanid")
        .send(update)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
    it("400: invalid patch", () => {
      const update = { inc_votes: "notanumber" };
      return request(app)
        .patch("/api/comments/1")
        .send(update)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
});

describe("checkCategoryExists()", () => {
  it("responds with row from specified id", () => {
    return checkCategoryExists("articles", "article_id", 1).then((response) => {
      expect(response[0].article_id).toEqual(1);
      expect(response[0].title).toEqual("Living in the shadow of a great man");
      expect(response[0].topic).toEqual("mitch");
      expect(response[0].author).toEqual("butter_bridge");
    });
  });
});

describe("/api/users", () => {
  describe("GET /api/users", () => {
    it("200: responds with all users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((response) => {
          expect(response.body.users).toEqual(data.userData);
        });
    });
  });
  describe("GET /api/users/:username", () => {
    it("200: responds with singular user", () => {
      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then((response) => {
          expect(response.body.user.username).toBe("butter_bridge");
          expect(response.body.user.name).toBe("jonny");
          expect(response.body.user.avatar_url).toBe(
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
          );
        });
    });
    it("404: responds with not found when no username found", () => {
      return request(app)
        .get("/api/users/howdy")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
  });
});
