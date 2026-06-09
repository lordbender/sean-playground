export type MetricCard = {
  label: string;
  value: string;
  accent: "primary" | "success" | "warning" | "error";
  detail: string;
  icon: "paid" | "calendar" | "article" | "thumbsUp";
};

export type SalesTrend = {
  title: string;
  change: string;
  totalRevenue: number;
  todaySales: number;
  points: number[];
};

export type RevenueBreakdown = {
  totalRevenue: number;
  channels: Array<{
    name: string;
    percentage: number;
    accent: string;
  }>;
};

export type TrafficSource = {
  name: string;
  percentage: number;
  accent: string;
};

export type MarketSignal = {
  name: string;
  change: number;
  accent: string;
};

export type DashboardSummary = {
  metrics: MetricCard[];
  salesTrend: SalesTrend;
  revenueBreakdown: RevenueBreakdown;
  trafficSources: TrafficSource[];
  marketSignals: MarketSignal[];
};

export type SystemStatus = {
  application: string;
  environment: string;
  database: string;
  identityProvider: string;
  timestamp: string;
};

