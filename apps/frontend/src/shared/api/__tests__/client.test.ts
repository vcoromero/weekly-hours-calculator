import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api, ApiRequestError } from "../client";

const fetchSpy = vi.fn();
const localStorageSpy = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchSpy);
  vi.stubGlobal("localStorage", localStorageSpy);
  fetchSpy.mockReset();
  localStorageSpy.getItem.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ApiRequestError", () => {
  it("has name ApiRequestError", () => {
    const error = new ApiRequestError("Not Found", 404);
    expect(error.name).toBe("ApiRequestError");
  });

  it("has status and message", () => {
    const error = new ApiRequestError("Bad Request", 400);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Bad Request");
  });

  it("preserves details", () => {
    const details = [{ field: "email", message: "invalid" }];
    const error = new ApiRequestError("Validation error", 422, details);
    expect(error.details).toEqual(details);
  });

  it("is instance of Error", () => {
    const error = new ApiRequestError("Server error", 500);
    expect(error instanceof Error).toBe(true);
  });
});

describe("api.get", () => {
  it("makes GET request to path without query params", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1" }),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.get("/workers");

    expect(fetchSpy).toHaveBeenCalledWith("/api/workers", expect.objectContaining({ headers: expect.any(Object) }));
  });

  it("appends query params to URL", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.get("/workers", { page: 1, isRegular: true });

    expect(fetchSpy).toHaveBeenCalledWith("/api/workers?page=1&isRegular=true", expect.any(Object));
  });

  it("filters out undefined values", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.get("/workers", { page: 1, search: undefined });

    const calledUrl = fetchSpy.mock.calls[0][0];
    expect(calledUrl).toBe("/api/workers?page=1");
    expect(calledUrl).not.toContain("search");
  });
});

describe("api.post", () => {
  it("makes POST request with JSON body", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: "1", name: "Alice" }),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.post("/workers", { name: "Alice", isRegular: true });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/workers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Alice", isRegular: true }),
      })
    );
  });

  it("sets Content-Type header", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({}),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.post("/workers", {});

    const headers = fetchSpy.mock.calls[0][1].headers;
    expect(headers["Content-Type"]).toBe("application/json");
  });
});

describe("api.put", () => {
  it("makes PUT request with JSON body", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1" }),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.put("/workers/1", { name: "Bob" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/workers/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Bob" }),
      })
    );
  });
});

describe("api.delete", () => {
  it("makes DELETE request without body", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve(undefined),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.delete("/workers/1");

    expect(fetchSpy).toHaveBeenCalledWith("/api/workers/1", expect.objectContaining({ method: "DELETE" }));
  });
});

describe("request", () => {
  it("includes Authorization header when token in localStorage", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    localStorageSpy.getItem.mockReturnValue("jwt-token-123");

    await api.get("/workers");

    const headers = fetchSpy.mock.calls[0][1].headers;
    expect(headers["Authorization"]).toBe("Bearer jwt-token-123");
  });

  it("omits Authorization header when no token", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.get("/workers");

    const headers = fetchSpy.mock.calls[0][1].headers;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("throws ApiRequestError for non-ok response", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "Bad Request", details: [] }),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await expect(api.get("/workers")).rejects.toThrow("Bad Request");
    await expect(api.get("/workers")).rejects.toThrow(ApiRequestError);
  });

  it("throws ApiRequestError with status 500 for server error", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Internal server error" }),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await expect(api.get("/workers")).rejects.toMatchObject({ status: 500 });
  });

  it("returns undefined for 204 response", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 204,
    });
    localStorageSpy.getItem.mockReturnValue(null);

    const result = await api.delete("/workers/1");
    expect(result).toBeUndefined();
  });

  it("parses JSON response on success", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "worker-1", name: "Alice" }),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    const result = await api.get("/workers/1");
    expect(result).toEqual({ id: "worker-1", name: "Alice" });
  });

  it("sets Content-Type application/json", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    localStorageSpy.getItem.mockReturnValue(null);

    await api.post("/workers", {});

    const headers = fetchSpy.mock.calls[0][1].headers;
    expect(headers["Content-Type"]).toBe("application/json");
  });
});