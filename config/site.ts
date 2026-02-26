/**
 * Master site configuration — controls tier, features, branding, and locale.
 *
 * Every visible string, image, and colour comes from DB or this config.
 * The setup script (`scripts/setup.sh`) or `scripts/setup-from-yoros.ts`
 * generates this file from the project manifest.
 */

export type Tier = "brochure" | "business" | "commerce";

export interface SiteConfig {
  name: string;
  description: string;
  domain: string;
  tier: Tier;
  locale: {
    default: "en" | "af";
    supported: ("en" | "af")[];
  };
  currency: string;
  timezone: string;
  brand: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    font: {
      heading: string;
      body: string;
    };
  };
  features: {
    blog: boolean;
    portfolio: boolean;
    booking: boolean;
    shop: boolean;
    lms: boolean;
    newsletter: boolean;
    i18n: boolean;
    customerAuth: boolean;
    portal: boolean;
    darkMode: boolean;
    whatsapp: boolean;
    googleMaps: boolean;
    serviceAreaPages: boolean;
    seoAdvanced: boolean;
    facebookPixel: boolean;
    googleCalendar: boolean;
    sessionCredits: boolean;
    billing: boolean;
    legalDocs: boolean;
    clientOnboarding: boolean;
    emailCampaigns: boolean;
    dripEmails: boolean;
    hybridPackages: boolean;
    multiCurrency: boolean;
    coupons: boolean;
    gifts: boolean;
    clientImport: boolean;
    microsoftGraph: boolean;
  };
  integrations: {
    paystack: boolean;
    googleAnalytics: boolean;
    resend: boolean;
  };
  pages: {
    home: boolean;
    about: boolean;
    services: boolean;
    contact: boolean;
    faq: boolean;
    terms: boolean;
    privacy: boolean;
  };
  /** Booking cancel/reschedule thresholds. Only used when features.booking is true. */
  bookingPolicy?: {
    cancelNoticeHours: number;
    maxReschedules: number;
    rescheduleNoticeHours: number;
    lateCancelForfeit: boolean;
    allowSameDayBooking: boolean;
  };
  /** Which optional profile fields to show. Only used when features.customerAuth is true. */
  clientFields?: {
    dateOfBirth: boolean;
    gender: boolean;
    address: boolean;
    relationshipStatus: boolean;
    emergencyContact: boolean;
    referralSource: boolean;
    medicalInfo: boolean;
    companyName: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: "The Deck Lab",
  description: "Custom decking — design your deck, order materials, or get it installed.",
  domain: "thedecklab.co.za",
  tier: "commerce",
  locale: { default: "en", supported: ["en", "af"] },
  currency: "ZAR",
  timezone: "Africa/Johannesburg",
  brand: {
    primary: "#D4622A",
    secondary: "#3D7A4A",
    accent: "#D4622A",
    dark: "#2A2826",
    font: { heading: "Plus Jakarta Sans", body: "Inter" },
  },
  features: {
    blog: false,
    portfolio: true,
    booking: false,
    shop: true,
    lms: false,
    newsletter: true,
    i18n: true,
    customerAuth: true,
    portal: true,
    darkMode: true,
    whatsapp: true,
    googleMaps: true,
    serviceAreaPages: false,
    seoAdvanced: false,
    facebookPixel: false,
    googleCalendar: false,
    sessionCredits: false,
    billing: false,
    legalDocs: false,
    clientOnboarding: false,
    emailCampaigns: true,
    dripEmails: true,
    hybridPackages: false,
    multiCurrency: false,
    coupons: false,
    gifts: false,
    clientImport: false,
    microsoftGraph: false,
  },
  integrations: {
    paystack: true,
    googleAnalytics: true,
    resend: true,
  },
  pages: {
    home: true,
    about: true,
    services: true,
    contact: true,
    faq: true,
    terms: true,
    privacy: true,
  },
};
