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

export type BackgroundDocumentSection = {
  heading: string;
  body: string;
};

export type BackgroundDocument = {
  title: string;
  sourceFileName: string;
  contentType: string;
  sections: BackgroundDocumentSection[];
};

export type BackgroundExperience = {
  roleTitle: string;
  organizationName: string;
  location?: string;
  dateLabel: string;
  durationLabel?: string;
  highlights: string[];
};

export type BackgroundEducation = {
  institutionName: string;
  degreeName: string;
  fieldOfStudy?: string;
  note?: string;
};

export type BackgroundSocialLink = {
  platformName: string;
  displayText: string;
  url: string;
  isActive: boolean;
};

export type BackgroundRepository = {
  ownerName: string;
  repositoryName: string;
  url: string;
  description: string;
  isFeatured: boolean;
};

export type BackgroundProfile = {
  displayName: string;
  headline: string;
  location: string;
  biography: string;
};

export type BackgroundSummary = {
  sectionKey: string;
  allowedRoles: string[];
  profile: BackgroundProfile;
  document: BackgroundDocument;
  experiences: BackgroundExperience[];
  education: BackgroundEducation[];
  socialLinks: BackgroundSocialLink[];
  repositories: BackgroundRepository[];
};
