import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { AppSection } from "../App";
import { NasaDashboard, NasaDonkiSeries, SystemStatus } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5100";

type DashboardPageProps = {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
};

export function DashboardPage({ activeSection, onNavigate }: DashboardPageProps) {
  const [dashboard, setDashboard] = useState<NasaDashboard | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${apiBaseUrl}/api/nasa/dashboard`).then((response) => response.json()),
      fetch(`${apiBaseUrl}/api/system/status`).then((response) => response.json())
    ]).then(([dashboardResponse, statusResponse]) => {
      setDashboard(dashboardResponse);
      setStatus(statusResponse);
    });
  }, []);

  return (
    <DashboardLayout activeSection={activeSection} onNavigate={onNavigate}>
      <Box className="dashboardHeader">
        <Box>
          <Typography variant="h4" fontWeight={800}>
            NASA Space Weather
          </Typography>
          <Typography color="text.secondary">
            {status
              ? `${status.environment} environment | Database ${status.database} | APOD and DONKI daily ingest`
              : "Loading workspace status"}
          </Typography>
        </Box>
      </Box>

      {dashboard ? (
        <Box className="nasaDashboard">
          <Card className="apodCard">
            <Box className="apodMedia">
              {dashboard.latestApod?.imageUrl ? (
                <img
                  src={`${apiBaseUrl}${dashboard.latestApod.imageUrl}`}
                  alt={dashboard.latestApod.title}
                />
              ) : (
                <Box className="apodPlaceholder">Awaiting APOD image</Box>
              )}
            </Box>
            <CardContent className="apodContent">
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Astronomy Picture of the Day" className="spaceChip" />
                {dashboard.latestApod ? <Chip label={formatDate(dashboard.latestApod.date)} className="spaceChip secondary" /> : null}
              </Stack>
              <Typography variant="h5" fontWeight={900}>
                {dashboard.latestApod?.title ?? "NASA APOD"}
              </Typography>
              <Typography className="apodExplanation">
                {dashboard.latestApod?.explanation ?? "The daily background worker will store the latest APOD image once NASA returns data."}
              </Typography>
              {dashboard.latestApod?.copyright ? (
                <Typography color="text.secondary" fontWeight={700}>
                  Credit: {dashboard.latestApod.copyright}
                </Typography>
              ) : null}
            </CardContent>
          </Card>

          <Box className="nasaAnalyticsGrid">
            <DonkiTrendChart series={dashboard.donkiSeries} windowStart={dashboard.windowStart} windowEnd={dashboard.windowEnd} />
            <DonkiDistributionChart series={dashboard.donkiSeries} />
          </Box>

          <Box className="donkiGrid">
            {dashboard.donkiSeries.map((series) => (
              <DonkiCard key={series.eventType} series={series} windowStart={dashboard.windowStart} windowEnd={dashboard.windowEnd} />
            ))}
          </Box>
        </Box>
      ) : (
        <Box className="loadingPanel">Loading dashboard</Box>
      )}
    </DashboardLayout>
  );
}

function DonkiTrendChart({ series, windowStart, windowEnd }: { series: NasaDonkiSeries[]; windowStart: string; windowEnd: string }) {
  const width = 680;
  const height = 240;
  const padding = { top: 24, right: 24, bottom: 34, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxCount = Math.max(...series.flatMap((item) => item.dailyCounts.map((count) => count.count)), 1);
  const dayCount = Math.max(...series.map((item) => item.dailyCounts.length), 1);

  const buildPath = (dailyCounts: NasaDonkiSeries["dailyCounts"]) => {
    return dailyCounts
      .map((item, index) => {
        const x = padding.left + (index / Math.max(dayCount - 1, 1)) * plotWidth;
        const y = padding.top + plotHeight - (item.count / maxCount) * plotHeight;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  };

  return (
    <Card className="nasaChartCard trendChartCard">
      <Box className="chartHeader">
        <Box>
          <Typography className="panelEyebrow">DONKI 30-day trend</Typography>
          <Typography variant="h6" fontWeight={900}>
            Space weather event velocity
          </Typography>
        </Box>
        <Typography color="text.secondary" fontWeight={700}>
          {formatDate(windowStart)} - {formatDate(windowEnd)}
        </Typography>
      </Box>
      <Box className="trendChartWrap">
        <svg className="trendChart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="DONKI event trend line chart">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padding.top + tick * plotHeight;
            return <line key={tick} x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chartGridLine" />;
          })}
          {series.map((item) => (
            <path key={item.eventType} d={buildPath(item.dailyCounts)} fill="none" stroke={item.accent} strokeWidth="4" strokeLinecap="round" />
          ))}
          {series.map((item) =>
            item.dailyCounts.map((count, index) => {
              if (count.count === 0) {
                return null;
              }

              const x = padding.left + (index / Math.max(dayCount - 1, 1)) * plotWidth;
              const y = padding.top + plotHeight - (count.count / maxCount) * plotHeight;

              return <circle key={`${item.eventType}-${count.date}`} cx={x} cy={y} r="4.5" fill={item.accent} />;
            })
          )}
          <text x={padding.left} y={height - 8} className="chartAxisText">
            {formatDate(windowStart)}
          </text>
          <text x={width - padding.right} y={height - 8} textAnchor="end" className="chartAxisText">
            {formatDate(windowEnd)}
          </text>
          <text x={padding.left - 10} y={padding.top + 4} textAnchor="end" className="chartAxisText">
            {maxCount}
          </text>
          <text x={padding.left - 10} y={padding.top + plotHeight + 4} textAnchor="end" className="chartAxisText">
            0
          </text>
        </svg>
      </Box>
      <Box className="chartLegend">
        {series.map((item) => (
          <span key={item.eventType}>
            <i style={{ backgroundColor: item.accent }} />
            {item.displayName}
          </span>
        ))}
      </Box>
    </Card>
  );
}

function DonkiDistributionChart({ series }: { series: NasaDonkiSeries[] }) {
  const maxTotal = Math.max(...series.map((item) => item.totalCount), 1);
  const totalEvents = series.reduce((sum, item) => sum + item.totalCount, 0);

  return (
    <Card className="nasaChartCard distributionCard">
      <Box className="chartHeader">
        <Box>
          <Typography className="panelEyebrow">Event mix</Typography>
          <Typography variant="h6" fontWeight={900}>
            DONKI distribution
          </Typography>
        </Box>
        <Box className="donkiTotal compact">{totalEvents}</Box>
      </Box>
      <Box className="distributionBars">
        {series.map((item) => (
          <Box className="distributionRow" key={item.eventType}>
            <Box className="distributionLabel">
              <Typography fontWeight={900}>{item.displayName}</Typography>
              <Typography color="text.secondary">{item.eventType}</Typography>
            </Box>
            <Box className="distributionTrack">
              <span style={{ width: `${Math.max(3, (item.totalCount / maxTotal) * 100)}%`, backgroundColor: item.accent }} />
            </Box>
            <Typography className="distributionValue">{item.totalCount}</Typography>
          </Box>
        ))}
      </Box>
      {totalEvents === 0 ? (
        <Typography className="donkiEmptyNote">
          NASA DONKI is reachable but currently returning no stored event data for this local cache. The graph will fill as successful daily fetches append events.
        </Typography>
      ) : null}
    </Card>
  );
}

function DonkiCard({ series, windowStart, windowEnd }: { series: NasaDonkiSeries; windowStart: string; windowEnd: string }) {
  const maxCount = Math.max(...series.dailyCounts.map((item) => item.count), 1);

  return (
    <Card className="donkiCard">
      <Box className="donkiCardHeader" style={{ borderColor: series.accent }}>
        <Box>
          <Typography className="panelEyebrow">{series.eventType}</Typography>
          <Typography variant="h6" fontWeight={900}>
            {series.displayName}
          </Typography>
        </Box>
        <Box className="donkiTotal" style={{ color: series.accent }}>
          {series.totalCount}
        </Box>
      </Box>
      <CardContent className="donkiCardBody">
        <Typography color="text.secondary" fontWeight={700}>
          {formatDate(windowStart)} - {formatDate(windowEnd)}
        </Typography>
        <Box className="donkiSparkline" aria-label={`${series.displayName} daily counts`}>
          {series.dailyCounts.map((item) => (
            <span
              key={item.date}
              title={`${formatDate(item.date)}: ${item.count}`}
              style={{
                height: `${Math.max(8, (item.count / maxCount) * 92)}%`,
                backgroundColor: item.count > 0 ? series.accent : "rgba(91, 26, 142, 0.14)"
              }}
            />
          ))}
        </Box>
        <Stack spacing={1.4}>
          {series.recentEvents.length > 0 ? (
            series.recentEvents.map((event) => (
              <Box className="donkiEventRow" key={event.externalId}>
                <Typography fontWeight={800}>{event.externalId}</Typography>
                <Typography color="text.secondary">{formatDateTime(event.occurredAt) ?? formatDate(event.eventDate)}</Typography>
              </Box>
            ))
          ) : (
            <Box>
              <Typography fontWeight={800}>No recent events stored</Typography>
              <LinearProgress sx={{ mt: 1.2 }} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value?: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
