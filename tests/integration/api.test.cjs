const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:8000";

async function post(endpoint, body) {
  const response = await fetch(`${baseUrl}/api/${endpoint}.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toMatch(/^application\/json\b/);
  // Invalid JSON (including PHP warnings mixed into the response) fails the test.
  return response.json();
}

test("valid credentials return the seeded user's JSON identity", async () => {
  const result = await post("Login", { login: "ci-user", password: "ci-test-only" });
  expect(result).toEqual({ id: 1, firstName: "Test", lastName: "User", error: "" });
});

test("invalid credentials return a structured login failure", async () => {
  const result = await post("Login", { login: "ci-user", password: "incorrect" });
  expect(result).toEqual({ id: 0, firstName: "", lastName: "", error: "No Records Found" });
});

test("a color added through PHP is persisted in MySQL and returned by partial search", async () => {
  const color = `CI Blue ${Date.now()}`;
  expect(await post("AddColor", { color, userId: 1 })).toEqual({ error: "" });
  const result = await post("SearchColors", { search: color.slice(3), userId: 1 });
  expect(result).toEqual({ results: [color], error: "" });
  expect(result.results.every(value => typeof value === "string")).toBe(true);

  // The same name must not be returned for another user's search.
  const otherUser = await post("SearchColors", { search: color, userId: 2 });
  expect(otherUser.error).toBe("No Records Found");
  expect(otherUser.results).toBeUndefined();
});

test("a search with no matches returns the current API's structured error", async () => {
  const result = await post("SearchColors", { search: "nonexistent-test-color", userId: 1 });
  expect(result).toEqual({ id: 0, firstName: "", lastName: "", error: "No Records Found" });
});
