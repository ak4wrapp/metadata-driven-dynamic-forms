// ui/src/hooks/useFetchAPI.ts
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:3000"
    : "https://metadata-driven-dynamic-forms.onrender.com";

export type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  cache?: boolean; // default true for GET
  ttl?: number;
  signal?: AbortSignal;
};

const DEFAULT_TTL = 5 * 60 * 1000;

export function useFetchAPI() {
  const queryClient = useQueryClient();

  const fetchInternal = useCallback(
    async <T = any>(url: string, options: FetchOptions = {}): Promise<T> => {
      const {
        method = "GET",
        body,
        headers,
        query,
        cache = method === "GET",
        ttl = DEFAULT_TTL,
        signal,
      } = options;

      const qs = query
        ? "?" +
          new URLSearchParams(
            Object.entries(query).reduce<Record<string, string>>(
              (acc, [k, v]) => {
                if (v !== undefined && v !== null) acc[k] = String(v);
                return acc;
              },
              {}
            )
          ).toString()
        : "";

      const fullUrl = `${BASE_URL}${url}${qs}`;
      const queryKey = [method, fullUrl];

      const executor = async (): Promise<T> => {
        const res = await window.fetch(fullUrl, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }

        return res.json();
      };

      // 🔹 Cache-aware GET
      if (cache && method === "GET") {
        return queryClient.fetchQuery({
          queryKey,
          queryFn: executor,
          staleTime: ttl,
        });
      }

      // 🔹 Mutations
      const result = await executor();

      if (method !== "GET") {
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) && q.queryKey[0] === "GET",
        });
      }

      return result;
    },
    [queryClient]
  );

  return { fetchInternal };
}
