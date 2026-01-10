// ui/src/hooks/useAPI.ts
import * as React from "react";

const BASE_URL = "http://127.0.0.1:3000";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface UseAPIOptions {
  method?: Method;
  body?: any;
  headers?: Record<string, string>;
  autoFetch?: boolean; // automatically call on mount
}

interface UseAPIResult<T = any> {
  data: T | null;
  loading: boolean;
  error: any;
  callAPI: (
    overrideUrl?: string,
    overrideOptions?: UseAPIOptions
  ) => Promise<T | null>;
}

export function useAPI<T = any>(
  url: string,
  options: UseAPIOptions = {}
): UseAPIResult<T> {
  const { method = "GET", autoFetch = false } = options;

  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(autoFetch);
  const [error, setError] = React.useState<any>(null);

  const callAPI = React.useCallback(
    async (overrideUrl?: string, overrideOptions?: UseAPIOptions) => {
      const fetchUrl = overrideUrl
        ? `${BASE_URL}${overrideUrl}`
        : `${BASE_URL}${url}`;
      const m = overrideOptions?.method || method;
      const b = overrideOptions?.body;
      const h = overrideOptions?.headers || {};

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(fetchUrl, {
          method: m,
          headers: { "Content-Type": "application/json", ...h },
          body: b ? JSON.stringify(b) : undefined,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }

        const json = await res.json();
        setData(json);
        return json;
      } catch (err) {
        setError(err);
        console.error("API call failed:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method] // <-- only url and method, no body/headers
  );

  // Auto-fetch on mount if requested
  React.useEffect(() => {
    if (autoFetch) callAPI();
  }, [autoFetch, callAPI]);

  return { data, loading, error, callAPI };
}
