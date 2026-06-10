import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { BackgroundPage } from "./pages/BackgroundPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentationPage } from "./pages/DocumentationPage";
import { LoginPage } from "./pages/LoginPage";

export type AppSection = "dashboard" | "background" | "documentation";

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

  if (activeSection === "background") {
    return <BackgroundPage activeSection={activeSection} onNavigate={setActiveSection} />;
  }

  if (activeSection === "documentation") {
    return <DocumentationPage activeSection={activeSection} onNavigate={setActiveSection} />;
  }

  return <DashboardPage activeSection={activeSection} onNavigate={setActiveSection} />;
}
