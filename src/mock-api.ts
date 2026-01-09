// mock-api.ts

type MockResponse = {
  delay?: number;
  data: any;
};
let cachedCountries: any[] | null = null;
let cachedStatesByCountry: Record<string, any[]> = {};

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

export function setupMockApi() {
  const originalFetch = window.fetch.bind(window);

  const mockFetch: typeof window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
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
    // Handle Countries API dynamically via Rest Countries
    // -------------------------
    if (basePath === "/api/countries") {
      const delay = 0;

      // ✅ Return cached data if available
      if (cachedCountries) {
        return new Response(JSON.stringify(cachedCountries), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      await new Promise((res) => setTimeout(res, delay));

      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );
        const data = await res.json();

        const countries = data
          .map((c: any) => ({
            code: c.cca2,
            name: c.name.common,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        // ✅ Cache it
        cachedCountries = countries;

        return new Response(JSON.stringify(countries), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to fetch countries", err);
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // -------------------------
    // Handle States API with dynamic country param
    // -------------------------
    if (basePath === "/api/states") {
      const countryCode = (query.get("country") || "US").toUpperCase().trim();
      const delay = 0;

      // ✅ Return cached states if available
      if (cachedStatesByCountry[countryCode]) {
        return new Response(
          JSON.stringify(cachedStatesByCountry[countryCode]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      await new Promise((res) => setTimeout(res, delay));

      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states"
        );
        const json = await res.json();

        const country = json.data.find(
          (c: any) =>
            c.iso2?.toUpperCase() === countryCode ||
            c.name?.toUpperCase() === countryCode
        );

        const states =
          country?.states
            ?.map((s: any) => ({
              code: s.state_code,
              name: s.name,
            }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];

        // ✅ Cache by country
        cachedStatesByCountry[countryCode] = states;

        return new Response(JSON.stringify(states), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to fetch states for country:", countryCode, err);
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // -------------------------
    // Handle any other static mock route
    // -------------------------
    if (mockRoutes[basePath]) {
      const { delay = 1000, data } = mockRoutes[basePath];
      await new Promise((res) => setTimeout(res, delay));

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // fallback to real fetch for any non-mocked routes
    // but add a small delay to simulate network latency
    await new Promise((res) => setTimeout(res, 2000));
    return originalFetch(input, init);
  };

  window.fetch = mockFetch;
}
