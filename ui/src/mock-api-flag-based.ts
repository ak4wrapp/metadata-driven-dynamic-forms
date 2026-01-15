// mock-api.ts
type MockResponse = {
  delay?: number;
  data: any;
};

const mockRoutes: Record<string, MockResponse> = {
  "/api/categories": {
    delay: 2500,
    data: [
      { value: "tech", label: "Technology" },
      { value: "finance", label: "Finance" },
      { value: "health", label: "Health" },
    ],
  },
};

// In-memory cache
const mockCache: Record<string, any> = {};

let originalFetch: typeof window.fetch | null = null;
let isMockEnabled = false;

function mockFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (!isMockEnabled || !originalFetch) return originalFetch!(input, init);

  return (async () => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    const parsedUrl = new URL(url, window.location.origin);
    const basePath = parsedUrl.pathname;
    const query = parsedUrl.searchParams;

    // -------------------------
    // Countries
    // -------------------------
    if (basePath === "/api/countries") {
      if (mockCache[basePath]) {
        await new Promise((res) => setTimeout(res, 1000));
        return new Response(JSON.stringify(mockCache[basePath]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        const res = await originalFetch!(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );
        const data = await res.json();
        const countries = data
          .map((c: any) => ({ code: c.cca2, name: c.name.common }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        mockCache[basePath] = countries;

        return new Response(JSON.stringify(countries), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify([]), { status: 200 });
      }
    }

    // -------------------------
    // States
    // -------------------------
    if (basePath === "/api/states") {
      const countryCode = (query.get("country") || "US").toUpperCase().trim();

      if (mockCache["/api/states"]) {
        await new Promise((res) => setTimeout(res, 1000));
        const states = mockCache["/api/states"]
          .filter((s: any) => s.countryCode === countryCode)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        return new Response(JSON.stringify(states), { status: 200 });
      }

      try {
        const res = await originalFetch!(
          "https://countriesnow.space/api/v0.1/countries/states"
        );
        const json = await res.json();
        const allStates = json.data.flatMap((c: any) =>
          c.states.map((s: any) => ({
            countryCode: c.iso2?.toUpperCase() || c.name.toUpperCase(),
            code: s.state_code,
            name: s.name,
          }))
        );
        mockCache["/api/states"] = allStates;

        const states = allStates
          .filter((s: any) => s.countryCode === countryCode)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        await new Promise((res) => setTimeout(res, 1000));

        return new Response(JSON.stringify(states), { status: 200 });
      } catch {
        return new Response(JSON.stringify([]), { status: 200 });
      }
    }

    // -------------------------
    // Static mock routes
    // -------------------------
    if (mockRoutes[basePath]) {
      const { delay = 100, data } = mockRoutes[basePath];
      await new Promise((res) => setTimeout(res, delay));
      return new Response(JSON.stringify(data), { status: 200 });
    }

    return originalFetch!(input, init);
  })();
}

export function enableMockApi() {
  if (isMockEnabled) return;
  originalFetch = window.fetch.bind(window);
  window.fetch = mockFetch as any;
  isMockEnabled = true;
}

export function disableMockApi() {
  if (!isMockEnabled) return;
  if (originalFetch) window.fetch = originalFetch;
  isMockEnabled = false;
}

// Optional: initialize automatically based on localStorage flag
if (localStorage.getItem("USE_MOCK_API") === "true") {
  enableMockApi();
}
