import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { BackgroundPage } from "./pages/BackgroundPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

export type AppSection = "dashboard" | "background";

export function App() {
  const { completeSignIn, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<AppSection>("dashboard");

  useEffect(() => {
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      completeSignIn();
    }
  }, [completeSignIn]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return activeSection === "background" ? (
    <BackgroundPage activeSection={activeSection} onNavigate={setActiveSection} />
  ) : (
    <DashboardPage activeSection={activeSection} onNavigate={setActiveSection} />
  );
}
