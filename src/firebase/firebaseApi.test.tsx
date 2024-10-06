import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ref, get, push } from "firebase/database";
import {
  fetchMovies,
  fetchMovieById,
  addMovie,
  fetchGenres,
} from "./firebaseApi";
import {
  mockMovies,
  mockMovieById,
  mockNewMovie,
} from "../tests/mocks/dataMocks";

// Mocka Firebase-uppstartning
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: {
      uid: "12345",
      email: "testuser@mail.com",
    },
  }),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  get: vi.fn(),
  push: vi.fn(),
}));

describe("Firebase API Tests", () => {
  const mockGet = get as Mock;
  const mockPush = push as Mock;
  const mockRef = ref as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch movies successfully", async () => {
    mockGet.mockResolvedValueOnce({
      val: () => mockMovies,
    });

    const movies = await fetchMovies();
    expect(movies).toEqual(mockMovies);
    expect(mockGet).toHaveBeenCalled();
  });

  it("should fetch a movie by ID successfully", async () => {
    const movieId = "movie1";
    mockRef.mockReturnValue({ val: vi.fn() }); // Mocka referensen
    mockGet.mockResolvedValueOnce({
      val: () => mockMovieById,
    });

    const movie = await fetchMovieById(movieId);
    expect(movie).toEqual({ ...mockMovieById, id: movieId });
    expect(mockGet).toHaveBeenCalled();
  });

  it("should return null when movie is not found", async () => {
    const consoleLogMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => {}); // Mocka console.log

    const movieId = "nonexistentMovie";

    mockRef.mockReturnValue({ val: vi.fn() }); // Mocka referensen
    mockGet.mockResolvedValueOnce({
      val: () => null,
    });

    const movie = await fetchMovieById(movieId);
    expect(movie).toBeNull();
    expect(mockGet).toHaveBeenCalled();
    consoleLogMock.mockRestore();
  });

  it("should add a new movie successfully", async () => {
    mockRef.mockReturnValue({ val: vi.fn() }); // Mocka referensen

    await addMovie(mockNewMovie);
    expect(mockPush).toHaveBeenCalledWith(mockRef(), mockNewMovie);
  });

  it("should fetch genres from movies", async () => {
    const consoleLogMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => {}); // Mocka console.log

    mockGet.mockResolvedValueOnce({
      val: () => mockMovies,
    });

    const genres = await fetchGenres();
    expect(genres).toEqual(expect.arrayContaining(["Action", "Drama"]));
    consoleLogMock.mockRestore();
  });

  it("should return empty array when no movies are found", async () => {
    const consoleWarnMock = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    mockGet.mockResolvedValueOnce({
      val: () => null,
    });

    const genres = await fetchGenres();
    expect(genres).toEqual([]);
    expect(consoleWarnMock).toHaveBeenCalledWith(
      "No movies found in database.",
    );

    consoleWarnMock.mockRestore();
  });
});
