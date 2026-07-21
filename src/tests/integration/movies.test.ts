import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../config/db.js";

// Test Data

const testUser = {
  name: "Movie Tester",
  email: "movietester@example.com",
  password: "password123",
};

const anotherUser = {
  name: "Other User",
  email: "otheruser@example.com",
  password: "password123",
};

const validMovie = {
  title: "Inception",
  releaseYear: 2010,
  overview: "A mind-bending thriller",
  genres: ["Sci-Fi", "Thriller"],
  runtime: 148,
  posterUrl: "https://example.com/inception.jpg",
};

// Helpers

async function registerAndGetToken(
  user: { name: string; email: string; password: string }
): Promise<string> {
  const res = await request(app).post("/auth/register").send(user);
  console.log(res.body);
  return res.body.data.token as string;
}

async function createMovieAsAuthUser(token: string, movie = validMovie) {
  const res = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${token}`)
    .send(movie);
  return res.body.data.movie;
}

// Test Suite

describe("Movie routes", () => {
  let testUserToken: string;
  let anotherUserToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.movie.deleteMany();
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.user.deleteMany({ where: { email: anotherUser.email } });

    testUserToken = await registerAndGetToken(testUser);
    anotherUserToken = await registerAndGetToken(anotherUser);
  });

  beforeEach(async () => {
    await prisma.movie.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.user.deleteMany({ where: { email: anotherUser.email } });
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /movies", () => {
    it("returns 200 and a paginated list", async () => {
      const res = await request(app).get("/movies");

      expect(res.status).toBe(200);
      expect(res.body.data.movies).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    it("respects ?page and ?limit query params", async () => {
      await createMovieAsAuthUser(testUserToken, { ...validMovie, title: "Movie A" });
      await createMovieAsAuthUser(testUserToken, { ...validMovie, title: "Movie B" });
      await createMovieAsAuthUser(testUserToken, { ...validMovie, title: "Movie C" });

      const res = await request(app).get("/movies?page=1&limit=2");

      expect(res.status).toBe(200);
      expect(res.body.data.movies).toHaveLength(2);
      expect(res.body.data.pagination.currentPage).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
      expect(res.body.data.pagination.totalItems).toBe(3);
    });

    it("returns 400 when limit exceeds 100", async () => {
      const res = await request(app).get("/movies?limit=101");
      expect(res.status).toBe(400);
    });

    it("returns 400 when page is non-positive", async () => {
      const res = await request(app).get("/movies?page=0");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /movies/:id", () => {
    it("returns 200 and the movie when it exists", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app).get(`/movies/${movie.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.movie.id).toBe(movie.id);
      expect(res.body.data.movie.title).toBe(validMovie.title);
    });

    it("returns 404 when the movie does not exist", async () => {
      const res = await request(app).get("/movies/nonexistent-id");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /movies", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/movies").send(validMovie);
      expect(res.status).toBe(401);
    });

    it("creates a movie and returns 201 with the created movie", async () => {
      const res = await request(app)
        .post("/movies")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send(validMovie);

      expect(res.status).toBe(201);
      expect(res.body.data.movie.title).toBe(validMovie.title);
      expect(res.body.data.movie.releaseYear).toBe(validMovie.releaseYear);
      expect(res.body.data.movie.id).toBeDefined();
    });

    it("returns 400 when required fields are missing (no title)", async () => {
      const { title, ...withoutTitle } = validMovie;

      const res = await request(app)
        .post("/movies")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send(withoutTitle);

      expect(res.status).toBe(400);
    });

    it("returns 400 when releaseYear is invalid (below 1888)", async () => {
      const res = await request(app)
        .post("/movies")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ ...validMovie, releaseYear: 1800 });

      expect(res.status).toBe(400);
    });

    it("returns 400 when posterUrl is not a valid URL", async () => {
      const res = await request(app)
        .post("/movies")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ ...validMovie, posterUrl: "not-a-url" });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /movies/:id", () => {
    it("returns 401 without a token", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app)
        .put(`/movies/${movie.id}`)
        .send({ title: "Updated Title" });

      expect(res.status).toBe(401);
    });

    it("returns 404 when the movie does not exist", async () => {
      const res = await request(app)
        .put("/movies/nonexistent-id")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ title: "Updated Title" });

      expect(res.status).toBe(404);
    });

    it("returns 403 when the user did not create the movie", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app)
        .put(`/movies/${movie.id}`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send({ title: "Updated Title" });

      expect(res.status).toBe(403);
    });

    it("updates the movie and returns 200", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app)
        .put(`/movies/${movie.id}`)
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ title: "Interstellar", runtime: 169 });

      expect(res.status).toBe(200);
      expect(res.body.data.updatedMovie.title).toBe("Interstellar");
      expect(res.body.data.updatedMovie.runtime).toBe(169);
    });

    it("returns 400 when the update payload is invalid (bad posterUrl)", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app)
        .put(`/movies/${movie.id}`)
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ posterUrl: "not-a-url" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /movies/:id", () => {
    it("returns 401 without a token", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app).delete(`/movies/${movie.id}`);

      expect(res.status).toBe(401);
    });

    it("returns 404 when the movie does not exist", async () => {
      const res = await request(app)
        .delete("/movies/nonexistent-id")
        .set("Authorization", `Bearer ${testUserToken}`);

      expect(res.status).toBe(404);
    });

    it("returns 403 when the user did not create the movie", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app)
        .delete(`/movies/${movie.id}`)
        .set("Authorization", `Bearer ${anotherUserToken}`);

      expect(res.status).toBe(403);
    });

    it("deletes the movie and returns 200", async () => {
      const movie = await createMovieAsAuthUser(testUserToken);

      const res = await request(app)
        .delete(`/movies/${movie.id}`)
        .set("Authorization", `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.movie.id).toBe(movie.id);

      // Confirm it's actually gone
      const check = await request(app).get(`/movies/${movie.id}`);
      expect(check.status).toBe(404);
    });
  });
});
