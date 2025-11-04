import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ParentDashboard from "./pages/ParentDashboard";
import ParentProfile from "./pages/ParentProfile";
import NewDeclaration from "./pages/NewDeclaration";
import EditDeclaration from "./pages/EditDeclaration";
import MairieDashboard from "./pages/MairieDashboard";
import MairieDeclarationDetail from "./pages/MairieDeclarationDetail";
import HopitalDashboard from "./pages/HopitalDashboard";
import HopitalVerificationDetail from "./pages/HopitalVerificationDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/dashboard"} component={ParentDashboard} />
      <Route path={"/profile"} component={ParentProfile} />
      <Route path={"/new-declaration"} component={NewDeclaration} />
      <Route path={"/edit-declaration/:id"} component={EditDeclaration} />
      <Route path={"/mairie/dashboard"} component={MairieDashboard} />
      <Route path={"/mairie/declaration/:id"} component={MairieDeclarationDetail} />
      <Route path={"/hopital/dashboard"} component={HopitalDashboard} />
      <Route path={"/hopital/verification/:id"} component={HopitalVerificationDetail} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
