export type OfferRole = 'artist' | 'producer' | 'engineer' | 'videographer' | 'studio';

export type OfferStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD';

export type LicenseOption = 'Non-Exclusive' | 'Exclusive';

export type EngineerService = 'Mix' | 'Master' | 'Tuning' | 'Bundle' | 'Atmos';

export type StemTier = 'Basic' | 'Standard' | 'Large';

export type VideographerCategory = 'Promo' | 'Performance' | 'Event' | 'EditingOnly' | 'Lyric';

// Base offer interface with common fields
export interface BaseOffer {
  id: string;
  userId: string;
  role: OfferRole;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  turnaroundDays: number;
  revisions: number;
  deliverables: string[];
  addons: OfferAddon[];
  usagePolicy?: string;
  media: string[]; // URLs to sample work, portfolios, etc.
  active: boolean;
  status: OfferStatus;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  
  // Analytics and performance
  views?: number;
  bookings?: number;
  completedBookings?: number;
  avgRating?: number;
  
  // Template source for tracking
  templateId?: string;
  isCustom?: boolean;
}

// Addon structure for offers
export interface OfferAddon {
  name: string;
  price: number;
  description?: string;
  required?: boolean;
}

// Producer-specific offer fields
export interface ProducerOfferFields {
  licenseOptions: LicenseOption[];
  previewUrl?: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  trackoutFileRefs?: string[]; // References to stems/trackouts
  stemCount?: number;
  instrumentalIncluded?: boolean;
  beatStarsLink?: string;
  exclusivePrice?: number; // Different price for exclusive licensing
}

// Studio-specific offer fields  
export interface StudioOfferFields {
  roomId?: string;
  depositPct?: number; // Percentage deposit required
  cancelWindowHours?: number; // Hours before session that cancellation is free
  calendarId?: string; // Integration with scheduling system
  hourlyRate?: number;
  minBookingHours?: number;
  maxBookingHours?: number;
  engineerIncluded?: boolean;
  engineerRate?: number;
  equipment?: string[]; // List of available equipment
  roomType?: string; // Vocal booth, live room, mixing room, etc.
}

// Videographer-specific offer fields
export interface VideographerOfferFields {
  category?: VideographerCategory;
  locations?: number; // Number of filming locations included
  crew?: number; // Number of crew members
  drone?: boolean; // Drone footage available
  editingIncluded?: boolean;
  rawFootageIncluded?: boolean;
  rushDelivery?: boolean; // Express delivery option
  shootingDays?: number; // Number of shooting days included
  videoLength?: number; // Max video length in minutes
  revisionRounds?: number;
}

// Engineer-specific offer fields
export interface EngineerOfferFields {
  service: EngineerService;
  stemTier?: StemTier;
  maxTracks?: number; // Maximum number of tracks/stems accepted
  includesMastering?: boolean; // For mix services
  includesTuning?: boolean; // Vocal tuning included
  analogGear?: string[]; // List of analog equipment used
  pluginList?: string[]; // DAW plugins available
  formatOptions?: string[]; // WAV, MP3, FLAC, etc.
  referenceTracksRequired?: boolean;
  stemDeliveryFormat?: string; // How stems are organized and delivered
}

// Artist-specific offer fields (for features, collabs, etc.)
export interface ArtistOfferFields {
  genresOffered?: string[];
  featureType?: 'Vocals' | 'Rap' | 'Songwriting' | 'Topline' | 'Full Song';
  lyricsIncluded?: boolean;
  melodyIncluded?: boolean;
  harmonyIncluded?: boolean;
  maxSongLength?: number; // In minutes
  keyRange?: string; // Vocal range or key preferences
  languagesOffered?: string[];
  creditRequirements?: string; // How artist wants to be credited
  publishingShare?: number; // Percentage of publishing if applicable
}

// Union type for role-specific offers
export type ProducerOffer = BaseOffer & { role: 'producer' } & ProducerOfferFields;
export type StudioOffer = BaseOffer & { role: 'studio' } & StudioOfferFields;
export type VideographerOffer = BaseOffer & { role: 'videographer' } & VideographerOfferFields;
export type EngineerOffer = BaseOffer & { role: 'engineer' } & EngineerOfferFields;
export type ArtistOffer = BaseOffer & { role: 'artist' } & ArtistOfferFields;

// Main offer type - discriminated union
export type Offer = ProducerOffer | StudioOffer | VideographerOffer | EngineerOffer | ArtistOffer;

// Offer template for configuration
export interface OfferTemplate {
  id: string;
  role: OfferRole;
  name: string;
  description: string;
  defaultPrice: number;
  currency: Currency;
  defaultTurnaround: number;
  defaultRevisions: number;
  defaultDeliverables: string[];
  defaultAddons: OfferAddon[];
  usagePolicyTemplate?: string;
  
  // Role-specific template fields
  roleSpecific: Record<string, any>;
  
  // Template metadata
  isPopular?: boolean;
  isRecommended?: boolean;
  category?: string;
  tags?: string[];
}

// Offer search and filter types
export interface OfferFilters {
  role?: OfferRole;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  maxTurnaround?: number;
  location?: string;
  tags?: string[];
  
  // Role-specific filters
  licenseOptions?: LicenseOption[]; // Producer
  bpmRange?: [number, number]; // Producer
  service?: EngineerService; // Engineer
  stemTier?: StemTier; // Engineer
  category?: VideographerCategory; // Videographer
  drone?: boolean; // Videographer
  roomType?: string; // Studio
  engineerIncluded?: boolean; // Studio
}

export interface OfferSearchResult {
  offers: Offer[];
  totalCount: number;
  hasMore: boolean;
  filters: OfferFilters;
  appliedFilters: string[];
}

// Booking integration
export interface OfferBookingData {
  offerId: string;
  title: string;
  price: number;
  currency: Currency;
  turnaroundDays: number;
  revisions: number;
  deliverables: string[];
  selectedAddons: OfferAddon[];
  totalPrice: number;
  
  // Snapshot of offer details for audit trail
  offerSnapshot: Partial<Offer>;
}

// Analytics and insights
export interface OfferAnalytics {
  offerId: string;
  views: number;
  viewsThisWeek: number;
  clickthroughs: number;
  bookings: number;
  completedBookings: number;
  avgRating: number;
  totalRevenue: number;
  conversionRate: number;
  
  // Time-based metrics
  peakViewDays: string[];
  avgResponseTime: number;
  completionRate: number;
  
  // Competitive insights
  pricingPosition: 'low' | 'competitive' | 'premium';
  marketShare: number;
}

// User offer limits and caps
export interface OfferLimits {
  maxActiveOffers: number;
  maxTotalOffers: number;
  maxMediaPerOffer: number;
  maxDeliverables: number;
  maxAddons: number;
  
  // Role-specific limits
  roleSpecificLimits: Record<OfferRole, Record<string, number>>;
}