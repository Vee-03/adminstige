import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// React Query provider (wrapped here for global caching/invalidation)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 0, // Disable automatic retries to avoid duplicate requests
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    {/* React Query Devtools — useful during development. Disabled in production builds by tree-shaking/imports. */}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
