import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from 'react';
import App from "./App";
import "./index.css";

// React Query Devtools - Optionnel
// Pour activer les devtools, installez: npm install @tanstack/react-query-devtools
// Puis décommentez les lignes ci-dessous :
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Configuration de React Query avec des options améliorées
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: true,
      refetchOnReconnect: true,
      retryOnMount: true,
    },
  },
});

// Récupérer l'élément racine
const container = document.getElementById("root");

if (!container) {
  throw new Error("L'élément racine 'root' est introuvable");
}

const root = createRoot(container);

// Rendre l'application avec des améliorations
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter 
        basename="/"
        future={{
          v7_startTransition: true, // Active les transitions React 18
        }}
      >
        <App />
        {/* React Query Devtools - Décommentez après installation de @tanstack/react-query-devtools */}
        {/* {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )} */}
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
