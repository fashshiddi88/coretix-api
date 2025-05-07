export interface UserInput {
  name: string;
  email: string;
  password: string;
  referredBy?: string;
  role: "CUSTOMER" | "ORGANIZER";
}
export interface UserPayLoad {
  id: number;
  name?: string;
  role?: "CUSTOMER" | "ORGANIZER";
  email?: string;
}

export interface EventQuery {
  search?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
}

export interface TicketTypeInput {
  name: string;
  price: number;
  totalQuantity: number;
}

export interface PromotionInput {
  title: string;
  code: string;
  amount: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  quota?: number;
}

export interface EventInput {
  title: string;
  description: string;
  category:
    | "SPORTS"
    | "MUSIC"
    | "ART"
    | "CONFERENCE"
    | "COMMUNITY"
    | "THEATER"
    | "EDUCATION"
    | "ATTRACTION";
  location: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  price: number;
  imageUrl: string;
  availableSeats: number;
  ticketTypes: TicketTypeInput[];
  promotions: PromotionInput[];
}

export interface StatisticsQuery {
  organizerId: number;
  period: "day" | "month" | "year";
  year: number;
  month?: number; // hanya untuk period = day
}
