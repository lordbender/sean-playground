import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PointerEvent as ReactPointerEvent, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { AppSection } from "../App";
import { NasaDashboard, NasaDonkiEventDetailResponse, NasaDonkiSeries, SystemStatus } from "../types";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5100").replace(/\/$/, "");

type DashboardPageProps = {
  activeSection: AppSection;
  isNavCollapsed: boolean;
  onNavigate: (section: AppSection) => void;
  onToggleNavigation: () => void;
};

type DateWindow = {
  start: string;
  end: string;
};

type DonkiDetailState = {
  open: boolean;
  loading: boolean;
  eventType: string;
  title: string;
  windowStart: string;
  windowEnd: string;
  data?: NasaDonkiEventDetailResponse;
  error?: string;
};

export function DashboardPage({ activeSection, isNavCollapsed, onNavigate, onToggleNavigation }: DashboardPageProps) {
  const [dashboard, setDashboard] = useState<NasaDashboard | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activeApodIndex, setActiveApodIndex] = useState(0);
  const [zoomWindow, setZoomWindow] = useState<DateWindow | null>(null);
  const [donkiDetail, setDonkiDetail] = useState<DonkiDetailState>({
    open: false,
    loading: false,
    eventType: "",
    title: "",
    windowStart: "",
    windowEnd: ""
  });

  useEffect(() => {
    Promise.all([
      fetch(`${apiBaseUrl}/api/nasa/dashboard`).then((response) => response.json()),
      fetch(`${apiBaseUrl}/api/system/status`).then((response) => response.json())
    ]).then(([dashboardResponse, statusResponse]) => {
      setDashboard(dashboardResponse);
      setStatus(statusResponse);
      setActiveApodIndex(0);
      setZoomWindow(null);
    });
  }, []);

  const visibleWindow = dashboard
    ? zoomWindow ?? { start: dashboard.windowStart, end: dashboard.windowEnd }
    : null;
  const visibleSeries = useMemo(
    () => dashboard && visibleWindow ? filterDonkiSeries(dashboard.donkiSeries, visibleWindow) : [],
    [dashboard, visibleWindow?.start, visibleWindow?.end]
  );
  const isZoomed = Boolean(dashboard && zoomWindow);

  const openDonkiDetails = async (series: NasaDonkiSeries, windowOverride?: DateWindow) => {
    const windowToLoad = windowOverride ?? visibleWindow;

    if (!windowToLoad) {
      return;
    }

    setDonkiDetail({
      open: true,
      loading: true,
      eventType: series.eventType,
      title: series.displayName,
      windowStart: windowToLoad.start,
      windowEnd: windowToLoad.end
    });

    try {
      const query = new URLSearchParams({
        startDate: windowToLoad.start,
        endDate: windowToLoad.end
      });
      const response = await fetch(`${apiBaseUrl}/api/nasa/donki/${series.eventType}/events?${query}`);

      if (!response.ok) {
        throw new Error(`DONKI detail request failed with ${response.status}`);
      }

      const data = await response.json() as NasaDonkiEventDetailResponse;
      setDonkiDetail({
        open: true,
        loading: false,
        eventType: data.eventType,
        title: data.displayName,
        windowStart: data.windowStart,
        windowEnd: data.windowEnd,
        data
      });
    } catch (error) {
      setDonkiDetail((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load DONKI detail."
      }));
    }
  };

  const closeDonkiDetails = () => {
    setDonkiDetail((current) => ({ ...current, open: false }));
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      isNavCollapsed={isNavCollapsed}
      onNavigate={onNavigate}
      onToggleNavigation={onToggleNavigation}
    >
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
          <ApodCarousel
            apods={dashboard.recentApods.length > 0 ? dashboard.recentApods : dashboard.latestApod ? [dashboard.latestApod] : []}
            activeIndex={activeApodIndex}
            onActiveIndexChange={setActiveApodIndex}
          />

          <Box className="nasaAnalyticsGrid">
            <DonkiTrendChart
              fullWindowStart={dashboard.windowStart}
              fullWindowEnd={dashboard.windowEnd}
              isZoomed={isZoomed}
              onOpenDetails={openDonkiDetails}
              onResetZoom={() => setZoomWindow(null)}
              onZoom={(start, end) => setZoomWindow({ start, end })}
              series={visibleSeries}
              windowStart={visibleWindow?.start ?? dashboard.windowStart}
              windowEnd={visibleWindow?.end ?? dashboard.windowEnd}
            />
            <DonkiDistributionChart
              isZoomed={isZoomed}
              onOpenDetails={openDonkiDetails}
              onResetZoom={() => setZoomWindow(null)}
              series={visibleSeries}
            />
          </Box>

          <Box className="donkiGrid">
            {visibleSeries.map((series) => (
              <DonkiCard
                key={series.eventType}
                onOpenDetails={openDonkiDetails}
                series={series}
                windowStart={visibleWindow?.start ?? dashboard.windowStart}
                windowEnd={visibleWindow?.end ?? dashboard.windowEnd}
              />
            ))}
          </Box>
          <DonkiDetailsDialog detail={donkiDetail} onClose={closeDonkiDetails} />
        </Box>
      ) : (
        <Box className="loadingPanel">Loading dashboard</Box>
      )}
    </DashboardLayout>
  );
}

function ApodCarousel({
  activeIndex,
  apods,
  onActiveIndexChange
}: {
  activeIndex: number;
  apods: NonNullable<NasaDashboard["latestApod"]>[];
  onActiveIndexChange: (index: number) => void;
}) {
  const selectedApod = apods[Math.min(activeIndex, Math.max(apods.length - 1, 0))];
  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < apods.length - 1;

  const movePrevious = () => {
    onActiveIndexChange(Math.max(0, activeIndex - 1));
  };

  const moveNext = () => {
    onActiveIndexChange(Math.min(apods.length - 1, activeIndex + 1));
  };

  return (
    <Card className="apodCard">
      <Box className="apodMedia">
        {selectedApod?.imageUrl ? (
          <img
            key={selectedApod.date}
            src={`${apiBaseUrl}${selectedApod.imageUrl}`}
            alt={selectedApod.title}
          />
        ) : (
          <Box className="apodPlaceholder">Awaiting APOD image</Box>
        )}
        {apods.length > 1 ? (
          <Box className="apodControls" aria-label="APOD carousel controls">
            <IconButton aria-label="Previous APOD image" onClick={movePrevious} disabled={!canGoPrevious}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography fontWeight={900}>
              {activeIndex + 1} / {apods.length}
            </Typography>
            <IconButton aria-label="Next APOD image" onClick={moveNext} disabled={!canGoNext}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        ) : null}
      </Box>
      <CardContent className="apodContent">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label="Astronomy Picture of the Day" className="spaceChip" />
          {selectedApod ? <Chip label={formatDate(selectedApod.date)} className="spaceChip secondary" /> : null}
          {apods.length > 1 ? <Chip label={`Last ${apods.length} stored images`} className="spaceChip" /> : null}
        </Stack>
        <Typography variant="h5" fontWeight={900}>
          {selectedApod?.title ?? "NASA APOD"}
        </Typography>
        <Typography className="apodExplanation">
          {selectedApod?.explanation ?? "The daily background worker will store the latest APOD image once NASA returns data."}
        </Typography>
        {selectedApod?.copyright ? (
          <Typography color="text.secondary" fontWeight={700}>
            Credit: {selectedApod.copyright}
          </Typography>
        ) : null}
        {apods.length > 1 ? (
          <Box className="apodThumbRail" aria-label="Recent APOD images">
            {apods.map((apod, index) => (
              <button
                className={index === activeIndex ? "active" : ""}
                key={apod.date}
                type="button"
                onClick={() => onActiveIndexChange(index)}
                aria-label={`Show APOD from ${formatDate(apod.date)}`}
              >
                <img src={`${apiBaseUrl}${apod.imageUrl}`} alt="" loading="lazy" />
                <span>{formatShortDate(apod.date)}</span>
              </button>
            ))}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DonkiTrendChart({
  fullWindowEnd,
  fullWindowStart,
  isZoomed,
  onOpenDetails,
  onResetZoom,
  onZoom,
  series,
  windowStart,
  windowEnd
}: {
  fullWindowEnd: string;
  fullWindowStart: string;
  isZoomed: boolean;
  onOpenDetails: (series: NasaDonkiSeries, windowOverride?: DateWindow) => void;
  onResetZoom: () => void;
  onZoom: (start: string, end: string) => void;
  series: NasaDonkiSeries[];
  windowStart: string;
  windowEnd: string;
}) {
  const width = 680;
  const height = 240;
  const padding = { top: 24, right: 24, bottom: 34, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxCount = Math.max(...series.flatMap((item) => item.dailyCounts.map((count) => count.count)), 1);
  const dayCount = Math.max(...series.map((item) => item.dailyCounts.length), 1);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragCurrentIndex, setDragCurrentIndex] = useState<number | null>(null);
  const dateSource = series[0]?.dailyCounts ?? [];

  const buildPath = (dailyCounts: NasaDonkiSeries["dailyCounts"]) => {
    return dailyCounts
      .map((item, index) => {
        const x = padding.left + (index / Math.max(dayCount - 1, 1)) * plotWidth;
        const y = padding.top + plotHeight - (item.count / maxCount) * plotHeight;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  };

  const getIndexFromPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dateSource.length === 0) {
      return 0;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - bounds.left) / bounds.width) * width;
    const ratio = Math.min(1, Math.max(0, (svgX - padding.left) / plotWidth));

    return Math.round(ratio * Math.max(dateSource.length - 1, 0));
  };

  const startDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    const index = getIndexFromPointer(event);
    setDragStartIndex(index);
    setDragCurrentIndex(index);
  };

  const updateDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragStartIndex === null) {
      return;
    }

    event.preventDefault();
    setDragCurrentIndex(getIndexFromPointer(event));
  };

  const finishDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragStartIndex === null || dateSource.length === 0) {
      setDragStartIndex(null);
      setDragCurrentIndex(null);
      return;
    }

    event.preventDefault();
    const endIndex = getIndexFromPointer(event);
    const minIndex = Math.min(dragStartIndex, endIndex);
    const maxIndex = Math.max(dragStartIndex, endIndex);

    if (maxIndex > minIndex) {
      onZoom(dateSource[minIndex].date, dateSource[maxIndex].date);
    }

    setDragStartIndex(null);
    setDragCurrentIndex(null);
  };

  const dragSelection = dragStartIndex !== null && dragCurrentIndex !== null
    ? {
        x: padding.left + (Math.min(dragStartIndex, dragCurrentIndex) / Math.max(dayCount - 1, 1)) * plotWidth,
        width: (Math.abs(dragCurrentIndex - dragStartIndex) / Math.max(dayCount - 1, 1)) * plotWidth
      }
    : null;

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
        {isZoomed ? (
          <Button size="small" variant="outlined" onClick={onResetZoom}>
            Reset
          </Button>
        ) : null}
      </Box>
      <Box className="trendChartWrap">
        <svg
          className="trendChart"
          onPointerCancel={() => {
            setDragStartIndex(null);
            setDragCurrentIndex(null);
          }}
          onPointerDown={startDrag}
          onPointerMove={updateDrag}
          onPointerUp={finishDrag}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          aria-label="DONKI event trend line chart. Drag horizontally to zoom into a date range."
        >
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padding.top + tick * plotHeight;
            return <line key={tick} x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chartGridLine" />;
          })}
          {dragSelection && dragSelection.width > 0 ? (
            <rect
              className="chartDragSelection"
              height={plotHeight}
              width={dragSelection.width}
              x={dragSelection.x}
              y={padding.top}
            />
          ) : null}
          {series.map((item) => (
            <path
              className="trendLine"
              key={item.eventType}
              d={buildPath(item.dailyCounts)}
              fill="none"
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetails(item);
              }}
              stroke={item.accent}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
          {series.map((item) =>
            item.dailyCounts.map((count, index) => {
              if (count.count === 0) {
                return null;
              }

              const x = padding.left + (index / Math.max(dayCount - 1, 1)) * plotWidth;
              const y = padding.top + plotHeight - (count.count / maxCount) * plotHeight;

              return (
                <circle
                  className="trendPoint"
                  key={`${item.eventType}-${count.date}`}
                  cx={x}
                  cy={y}
                  fill={item.accent}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenDetails(item, { start: count.date, end: count.date });
                  }}
                  r="4.5"
                />
              );
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
          <button key={item.eventType} type="button" onClick={() => onOpenDetails(item)}>
            <i style={{ backgroundColor: item.accent }} />
            {item.displayName}
          </button>
        ))}
      </Box>
      <Typography className="chartHint">
        Drag across the line chart to zoom from {formatDate(fullWindowStart)} through {formatDate(fullWindowEnd)}. Click a line, point, bar, or card for DONKI detail.
      </Typography>
    </Card>
  );
}

function DonkiDistributionChart({
  isZoomed,
  onOpenDetails,
  onResetZoom,
  series
}: {
  isZoomed: boolean;
  onOpenDetails: (series: NasaDonkiSeries) => void;
  onResetZoom: () => void;
  series: NasaDonkiSeries[];
}) {
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
        {isZoomed ? (
          <Button size="small" variant="outlined" onClick={onResetZoom}>
            Reset
          </Button>
        ) : null}
      </Box>
      <Box className="distributionBars">
        {series.map((item) => (
          <button className="distributionRow" key={item.eventType} type="button" onClick={() => onOpenDetails(item)}>
            <Box className="distributionLabel">
              <Typography fontWeight={900}>{item.displayName}</Typography>
              <Typography color="text.secondary">{item.eventType}</Typography>
            </Box>
            <Box className="distributionTrack">
              <span style={{ width: `${Math.max(3, (item.totalCount / maxTotal) * 100)}%`, backgroundColor: item.accent }} />
            </Box>
            <Typography className="distributionValue">{item.totalCount}</Typography>
          </button>
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

function DonkiCard({
  onOpenDetails,
  series,
  windowStart,
  windowEnd
}: {
  onOpenDetails: (series: NasaDonkiSeries, windowOverride?: DateWindow) => void;
  series: NasaDonkiSeries;
  windowStart: string;
  windowEnd: string;
}) {
  const maxCount = Math.max(...series.dailyCounts.map((item) => item.count), 1);

  return (
    <Card
      className="donkiCard"
      onClick={() => onOpenDetails(series)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(series);
        }
      }}
      role="button"
      tabIndex={0}
    >
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
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetails(series, { start: item.date, end: item.date });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenDetails(series, { start: item.date, end: item.date });
                }
              }}
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

function DonkiDetailsDialog({ detail, onClose }: { detail: DonkiDetailState; onClose: () => void }) {
  return (
    <Dialog open={detail.open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            label={detail.eventType || "DONKI"}
            sx={{ backgroundColor: detail.data?.accent ?? "var(--sp-purple)", color: "#fff8e8", fontWeight: 900 }}
          />
          <Typography component="span" fontWeight={900}>
            {detail.title || "DONKI Detail"}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.4}>
          <Box className="donkiDetailSummary">
            <Box>
              <Typography className="panelEyebrow">Window</Typography>
              <Typography fontWeight={900}>
                {detail.windowStart && detail.windowEnd
                  ? `${formatDate(detail.windowStart)} - ${formatDate(detail.windowEnd)}`
                  : "Loading"}
              </Typography>
            </Box>
            <Box>
              <Typography className="panelEyebrow">Events</Typography>
              <Typography fontWeight={900}>{detail.data?.events.length ?? 0}</Typography>
            </Box>
          </Box>

          {detail.loading ? (
            <Box>
              <Typography fontWeight={800}>Loading DONKI detail</Typography>
              <LinearProgress sx={{ mt: 1.2 }} />
            </Box>
          ) : null}

          {detail.error ? (
            <Typography className="donkiEmptyNote">{detail.error}</Typography>
          ) : null}

          {!detail.loading && detail.data?.events.length === 0 ? (
            <Typography className="donkiEmptyNote">No stored DONKI events are available for this selection.</Typography>
          ) : null}

          {detail.data?.events.map((event) => {
            const fields = summarizeRawPayload(event.rawJsonPayload);

            return (
              <Box className="donkiDetailEvent" key={event.externalId}>
                <Stack spacing={0.6}>
                  <Typography variant="h6" fontWeight={900}>{event.externalId}</Typography>
                  <Typography color="text.secondary" fontWeight={700}>
                    {formatDateTime(event.occurredAt) ?? formatDate(event.eventDate)} | fetched {formatDateTime(event.fetchedAt)}
                  </Typography>
                </Stack>
                {fields.length > 0 ? (
                  <Box className="donkiDetailFieldGrid">
                    {fields.map(([key, value]) => (
                      <Box key={key}>
                        <Typography className="panelEyebrow">{key}</Typography>
                        <Typography fontWeight={800}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : null}
                <Divider />
                <Box>
                  <Typography className="panelEyebrow">Raw NASA payload</Typography>
                  <pre className="donkiRawPayload">{formatRawPayload(event.rawJsonPayload)}</pre>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function filterDonkiSeries(series: NasaDonkiSeries[], window: DateWindow) {
  return series.map((item) => {
    const dailyCounts = item.dailyCounts.filter((count) => count.date >= window.start && count.date <= window.end);
    const recentEvents = item.recentEvents.filter((event) => event.eventDate >= window.start && event.eventDate <= window.end);
    const totalCount = dailyCounts.reduce((sum, count) => sum + count.count, 0);

    return {
      ...item,
      dailyCounts,
      latestOccurredAt: recentEvents[0]?.occurredAt,
      recentEvents,
      totalCount
    };
  });
}

function summarizeRawPayload(rawJsonPayload: string) {
  try {
    const payload = JSON.parse(rawJsonPayload) as Record<string, unknown>;

    return Object.entries(payload)
      .filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
      .slice(0, 8)
      .map(([key, value]) => [key, value === null ? "null" : String(value)] as const);
  } catch {
    return [];
  }
}

function formatRawPayload(rawJsonPayload: string) {
  try {
    return JSON.stringify(JSON.parse(rawJsonPayload), null, 2);
  } catch {
    return rawJsonPayload;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00Z`));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00Z`));
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
