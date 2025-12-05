export type UserRole = "customer" | "admin"
export type TeamType = "yellow" | "blue"
export type ShowType = "ensemble_show" | "standalone"
export type ShowStatus = "scheduled" | "on_sale" | "sold_out" | "cancelled" | "completed"
export type SeatStatus = "available" | "reserved" | "sold" | "blocked"
export type BookingStatus = "pending" | "confirmed" | "used" | "cancelled" | "refunded"
export type PurchaseStatus = "pending" | "completed" | "failed" | "refunded"
export type DiscountType = "percentage" | "fixed"
export type DiscountApplicableTo = "recordings" | "shows" | "both"

export interface User {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CastMember {
  name: string
  role: string
  bio?: string
  photo_url?: string
}

export interface CrewMember {
  name: string
  role: string
  photo_url?: string
}

export interface PressQuote {
  quote: string
  source: string
  url?: string
}

export interface Award {
  name: string
  year: number
  category?: string
}

export interface CustomSection {
  title: string
  content: string
  order: number
}

export interface Ensemble {
  id: string
  title: string
  slug: string
  description?: string
  director?: string
  yellow_team_name: string
  blue_team_name: string
  yellow_cast: CastMember[]
  blue_cast: CastMember[]
  crew: CrewMember[]
  genre: string[]
  duration_minutes?: number
  year?: number
  language: string
  premiere_date?: string
  age_rating?: string
  thumbnail_url?: string
  banner_url?: string
  hero_video_url?: string
  gallery_images: string[]
  trailer_url?: string
  synopsis_short?: string
  synopsis_long?: string
  awards: Award[]
  press_quotes: PressQuote[]
  recording_price_nok: number
  is_published: boolean
  featured: boolean
  view_count: number
  custom_sections: CustomSection[]
  created_at: string
  updated_at: string
}

export interface Recording {
  id: string
  ensemble_id: string
  team: TeamType
  recording_date?: string
  jottacloud_embed_url?: string
  quality: string
  duration?: number
  thumbnail_url?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  user_id: string
  ensemble_id: string
  recording_ids: string[]
  vipps_order_id?: string
  amount_paid_nok: number
  discount_code?: string
  status: PurchaseStatus
  access_granted_at?: string
  access_expires_at?: string
  created_at: string
  updated_at: string
}

export interface SeatMapRow {
  number: string
  seats: number[]
}

export interface SeatMapSection {
  name: string
  rows: SeatMapRow[]
}

export interface SeatMapConfig {
  sections: SeatMapSection[]
}

export interface Venue {
  id: string
  name: string
  address?: string
  postal_code?: string
  city?: string
  capacity: number
  seat_map_config: SeatMapConfig
  amenities: string[]
  accessibility_info?: string
  parking_info?: string
  public_transport?: string
  images: string[]
  created_at: string
  updated_at: string
}

export interface PriceTier {
  name: string
  price: number
  description?: string
}

export interface Show {
  id: string
  ensemble_id?: string
  title?: string
  type: ShowType
  team?: TeamType
  show_datetime: string
  doors_open_time?: string
  venue_id?: string
  base_price_nok: number
  price_tiers: PriceTier[]
  status: ShowStatus
  available_seats: number
  is_part_of_series: boolean
  series_id?: string
  special_notes?: string
  age_restriction?: string
  duration_override?: number
  created_at: string
  updated_at: string
  // Joined data
  ensemble?: Ensemble
  venue?: Venue
}

export interface Seat {
  id: string
  show_id: string
  section: string
  row: string
  number: number
  price_tier?: string
  price_nok: number
  status: SeatStatus
  reserved_until?: string
  blocked_reason?: string
  created_at: string
  updated_at: string
}

export interface QRCodeData {
  booking_id: string
  reference: string
  show_id: string
  show_title: string
  show_datetime: string
  customer_name: string
  seats: Array<{ section: string; row: string; number: number }>
  checked_in: boolean
  signature: string
}

export interface Booking {
  id: string
  user_id?: string
  show_id: string
  seat_ids: string[]
  vipps_order_id?: string
  total_amount_nok: number
  booking_reference: string
  qr_code_data?: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  status: BookingStatus
  booked_at: string
  confirmed_at?: string
  checked_in_at?: string
  checked_in_by?: string
  special_requests?: string
  ticket_sent: boolean
  created_at: string
  updated_at: string
  // Joined data
  show?: Show
  seats?: Seat[]
}

export interface DiscountCode {
  id: string
  code: string
  type: DiscountType
  value: number
  valid_from?: string
  valid_until?: string
  max_uses?: number
  current_uses: number
  applicable_to: DiscountApplicableTo
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Series {
  id: string
  title: string
  description?: string
  shows_count: number
  start_date?: string
  end_date?: string
  discount_percentage: number
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  hero_message: { title: string; subtitle: string }
  featured_ensembles: string[]
  contact_info: { email: string; phone: string; address: string }
  social_links: { facebook: string; instagram: string; youtube: string }
  about_text: string
  booking_terms: string
  faq: Array<{ question: string; answer: string }>
}
