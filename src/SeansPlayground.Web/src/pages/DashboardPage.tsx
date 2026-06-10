import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { MetricSummaryCard } from "../components/MetricSummaryCard";
import { RevenueCard } from "../components/RevenueCard";
import { SalesTrendCard } from "../components/SalesTrendCard";
import { TrafficSourcesCard } from "../components/TrafficSourcesCard";
import { AppSection } from "../App";
import { DashboardSummary, SystemStatus } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5100";

type DashboardPageProps = {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
};

export function DashboardPage({ activeSection, onNavigate }: DashboardPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${apiBaseUrl}/api/dashboard/summary`).then((response) => response.json()),
      fetch(`${apiBaseUrl}/api/system/status`).then((response) => response.json())
    ]).then(([summaryResponse, statusResponse]) => {
      setSummary(summaryResponse);
      setStatus(statusResponse);
    });
  }, []);

  return (
    <DashboardLayout activeSection={activeSection} onNavigate={onNavigate}>
      <Box className="dashboardHeader">
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Dashboard
          </Typography>
          <Typography color="text.secondary">
            {status ? `${status.environment} environment | Database ${status.database}` : "Loading workspace status"}
          </Typography>
        </Box>
      </Box>

      {summary ? (
        <>
          <Box className="metricGrid">
            {summary.metrics.map((metric) => (
              <MetricSummaryCard key={metric.label} metric={metric} />
            ))}
          </Box>
          <Box className="panelGrid">
            <SalesTrendCard trend={summary.salesTrend} signals={summary.marketSignals} />
            <RevenueCard revenue={summary.revenueBreakdown} />
            <TrafficSourcesCard sources={summary.trafficSources} />
          </Box>
        </>
      ) : (
        <Box className="loadingPanel">Loading dashboard</Box>
      )}
    </DashboardLayout>
  );
}
