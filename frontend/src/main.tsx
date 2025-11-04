import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Configuration de l'application avec React Router v6
const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Rendre l'application
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AppWithRouter />
  </QueryClientProvider>
);
