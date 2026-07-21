import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../config/db.js";

// Test Data

const testUser = { 
    name: "Watchlist Tester", 
    email: "watchlist@example.com", 
    password: "password123" 
};

const validMovie = {
  title: "The Matrix",
  releaseYear: 1999,
  overview: "A computer hacker learns about the true nature of his reality.",
  genres: ["Action", "Sci-Fi"],
  runtime: 136,
  posterUrl: "https://example.com/matrix.jpg",
};

// Helpers

async function registerAndGetToken(user: typeof testUser): Promise<string> {
  const res = await request(app).post("/auth/register").send(user);
  return res.body.data.token as string;
}

// Test Suite 

describe("Watchlist routes", () => {
  let testUserToken: string;
  let testMovieId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.watchlistItem.deleteMany();
    await prisma.movie.deleteMany({ where: { title: validMovie.title } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    testUserToken = await registerAndGetToken(testUser);

    const movieRes = await request(app)
      .post("/movies")
      .set("Authorization", `Bearer ${testUserToken}`)
      .send(validMovie);

    testMovieId = movieRes.body.data.movie.id;
  });

  beforeEach(async () => {
    await prisma.watchlistItem.deleteMany();
  });

  afterAll(async () => {
    await prisma.watchlistItem.deleteMany();
    await prisma.movie.deleteMany({ where: { title: validMovie.title } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe("POST /watchlist", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app).post("/watchlist").send({ movieId: testMovieId });
      expect(res.status).toBe(401);
    });

    it("adds a movie to the watchlist and returns 201", async () => {
      const res = await request(app)
        .post("/watchlist")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ movieId: testMovieId, status: "TO_WATCH", rating: 9 });

        console.log("response:", res.status, res.body);
        console.log("testMovieId:", testMovieId);

      expect(res.status).toBe(201);
      expect(res.body.data.watchlistItem.movieId).toBe(testMovieId);
      expect(res.body.data.watchlistItem.status).toBe("TO_WATCH");
      expect(res.body.data.watchlistItem.rating).toBe(9);
    });

    it("returns 400 when movieId is invalid or missing", async () => {
      const res = await request(app)
        .post("/watchlist")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ status: "TO_WATCH" }); 

      expect(res.status).toBe(400);
    });

    it("returns 404 when movie does not exist", async () => {
      const fakeMovieId = "123e4567-e89b-12d3-a456-426614174000"; 
      const res = await request(app)
        .post("/watchlist")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ movieId: fakeMovieId });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /watchlist", () => {
    it("returns 200 and a paginated list for the logged-in user", async () => {
      await request(app)
        .post("/watchlist")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ movieId: testMovieId });

      const res = await request(app)
        .get("/watchlist")
        .set("Authorization", `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.watchlist).toBeInstanceOf(Array);
      expect(res.body.data.watchlist.length).toBe(1);
      expect(res.body.data.pagination).toBeDefined();
    });
  });

  describe("PUT /watchlist/:id", () => {
    it("updates the watchlist item and returns 200", async () => {
      const addRes = await request(app)
        .post("/watchlist")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ movieId: testMovieId, status: "TO_WATCH" });
      
      const watchlistItemId = addRes.body.data.watchlistItem.id;

      const res = await request(app)
        .put(`/watchlist/${watchlistItemId}`)
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ status: "COMPLETED", rating: 10, notes: "Incredible!" });

      expect(res.status).toBe(200);
      expect(res.body.data.updatedWatchlistItem.status).toBe("COMPLETED");
      expect(res.body.data.updatedWatchlistItem.rating).toBe(10);
      expect(res.body.data.updatedWatchlistItem.notes).toBe("Incredible!");
    });
  });

  describe("DELETE /watchlist/:id", () => {
    it("deletes the watchlist item and returns 200", async () => {
      const addRes = await request(app)
        .post("/watchlist")
        .set("Authorization", `Bearer ${testUserToken}`)
        .send({ movieId: testMovieId });
      
      const watchlistItemId = addRes.body.data.watchlistItem.id;

      const res = await request(app)
        .delete(`/watchlist/${watchlistItemId}`)
        .set("Authorization", `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      
      const checkRes = await request(app)
        .get(`/watchlist/${watchlistItemId}`)
        .set("Authorization", `Bearer ${testUserToken}`);
      
      expect(checkRes.status).toBe(404);
    });
  });
});
