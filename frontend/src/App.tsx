import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ParentDashboard from "./pages/ParentDashboard";
import ParentProfile from "./pages/ParentProfile";
import NewDeclaration from "./pages/NewDeclaration";
import EditDeclaration from "./pages/EditDeclaration";
import ParentDeclarationDetail from "./pages/ParentDeclarationDetail";
import Payment from "./pages/Payment";
import MairieDashboard from "./pages/MairieDashboard";
import MairieDeclarationDetail from "./pages/MairieDeclarationDetail";
import HopitalDashboard from "./pages/HopitalDashboard";
import HopitalVerificationDetail from "./pages/HopitalVerificationDetail";
import { ROLES, UserRole } from "./config/roles";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect } from "react";


function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirection si l'utilisateur est déjà connecté
  useEffect(() => {
    if ((location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') && 
        localStorage.getItem('token')) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const redirectPath = user.role === ROLES.MAIRIE ? '/mairie/dashboard' : 
                         user.role === ROLES.HOPITAL ? '/hopital/dashboard' : '/dashboard';
      navigate(redirectPath);
    }
  }, [location, navigate]);

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Routes protégées pour les parents */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.ADMIN]}>
          <ParentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.ADMIN]}>
          <ParentProfile />
        </ProtectedRoute>
      } />
      <Route path="/new-declaration" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.ADMIN]}>
          <NewDeclaration />
        </ProtectedRoute>
      } />
      <Route path="/edit-declaration/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.ADMIN]}>
          <EditDeclaration />
        </ProtectedRoute>
      } />
      <Route path="/declaration/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.ADMIN]}>
          <ParentDeclarationDetail />
        </ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.ADMIN]}>
          <Payment />
        </ProtectedRoute>
      } />
      
      {/* Routes protégées pour la mairie */}
      <Route path="/mairie/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.MAIRIE, ROLES.ADMIN]}>
          <MairieDashboard />
        </ProtectedRoute>
      } />
      <Route path="/mairie/declaration/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.MAIRIE, ROLES.ADMIN]}>
          <MairieDeclarationDetail />
        </ProtectedRoute>
      } />
      
      {/* Routes protégées pour l'hôpital */}
      <Route path="/hopital/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.HOPITAL, ROLES.ADMIN]}>
          <HopitalDashboard />
        </ProtectedRoute>
      } />
      <Route path="/hopital/verification/:id" element={
        <ProtectedRoute allowedRoles={[ROLES.HOPITAL, ROLES.ADMIN]}>
          <HopitalVerificationDetail />
        </ProtectedRoute>
      } />
      
      {/* 404 et routes inconnues */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
          <AppRouter />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
