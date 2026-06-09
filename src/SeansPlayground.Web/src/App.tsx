import { useEffect } from "react";
import { useAuth } from "./auth/AuthProvider";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

export function App() {
  const { completeSignIn, isAuthenticated } = useAuth();

  useEffect(() => {
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      completeSignIn();
    }
  }, [completeSignIn]);

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

