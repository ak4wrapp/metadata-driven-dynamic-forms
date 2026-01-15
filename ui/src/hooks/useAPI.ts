// ui/src/hooks/useAPI.ts
import * as React from "react";
import { useFetchAPI } from "./useFetchAPI";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface UseAPIOptions {
  method?: Method;
  body?: any;
  headers?: Record<string, string>;
  autoFetch?: boolean;
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
  const { fetchInternal } = useFetchAPI();

  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(autoFetch);
  const [error, setError] = React.useState<any>(null);

  const callAPI = React.useCallback(
    async (overrideUrl?: string, overrideOptions?: UseAPIOptions) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchInternal<T>(overrideUrl ?? url, {
          method: overrideOptions?.method ?? method,
          body: overrideOptions?.body,
          headers: overrideOptions?.headers,
          cache: true,
        });

        setData(result);
        return result;
      } catch (err) {
        setError(err);
        console.error("API call failed:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method, fetchInternal]
  );

  React.useEffect(() => {
    if (autoFetch) callAPI();
  }, [autoFetch, callAPI]);

  return { data, loading, error, callAPI };
}
