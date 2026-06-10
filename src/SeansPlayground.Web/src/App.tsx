import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { LoginPage } from "./pages/LoginPage";

export type AppSection = "dashboard" | "background" | "documentation";

const BackgroundPage = lazy(() => import("./pages/BackgroundPage").then((module) => ({ default: module.BackgroundPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const DocumentationPage = lazy(() => import("./pages/DocumentationPage").then((module) => ({ default: module.DocumentationPage })));

export function App() {
  const { completeSignIn, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<AppSection>("dashboard");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      completeSignIn();
    }
  }, [completeSignIn]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (activeSection === "background") {
    return (
      <Suspense fallback={<PageLoading />}>
        <BackgroundPage
          activeSection={activeSection}
          isNavCollapsed={isNavCollapsed}
          onNavigate={setActiveSection}
          onToggleNavigation={() => setIsNavCollapsed((current) => !current)}
        />
      </Suspense>
    );
  }

  if (activeSection === "documentation") {
    return (
      <Suspense fallback={<PageLoading />}>
        <DocumentationPage
          activeSection={activeSection}
          isNavCollapsed={isNavCollapsed}
          onNavigate={setActiveSection}
          onToggleNavigation={() => setIsNavCollapsed((current) => !current)}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardPage
        activeSection={activeSection}
        isNavCollapsed={isNavCollapsed}
        onNavigate={setActiveSection}
        onToggleNavigation={() => setIsNavCollapsed((current) => !current)}
      />
    </Suspense>
  );
}

function PageLoading() {
  return <div className="loadingPanel">Loading workspace</div>;
}
