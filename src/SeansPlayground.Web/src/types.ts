export type NasaApod = {
  date: string;
  title: string;
  explanation: string;
  copyright?: string;
  mediaType: string;
  sourceUrl: string;
  hdUrl?: string;
  imageUrl?: string;
  fetchedAt: string;
};

export type NasaDailyCount = {
  date: string;
  count: number;
};

export type NasaDonkiEvent = {
  eventType: string;
  externalId: string;
  occurredAt?: string;
  eventDate: string;
};

export type NasaDonkiEventDetail = NasaDonkiEvent & {
  displayName: string;
  accent: string;
  fetchedAt: string;
  rawJsonPayload: string;
};

export type NasaDonkiEventDetailResponse = {
  eventType: string;
  displayName: string;
  accent: string;
  windowStart: string;
  windowEnd: string;
  events: NasaDonkiEventDetail[];
};

export type NasaDonkiSeries = {
  eventType: string;
  displayName: string;
  accent: string;
  totalCount: number;
  latestOccurredAt?: string;
  dailyCounts: NasaDailyCount[];
  recentEvents: NasaDonkiEvent[];
};

export type NasaDashboard = {
  latestApod?: NasaApod;
  recentApods: NasaApod[];
  donkiSeries: NasaDonkiSeries[];
  windowStart: string;
  windowEnd: string;
  generatedAt: string;
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
