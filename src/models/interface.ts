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

export interface TicketTypeInput {
  name: string;
  price: number;
  totalQuantity: number;
}

export interface EventInput {
  title: string;
  description: string;
  category:
    | "KONSER"
    | "KONFERENSI"
    | "WORKSHOP"
    | "PERTANDINGAN"
    | "PERTUNJUKAN"
    | "PAMERAN";
  location: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  price: number;
  imageUrl: string;
  availableSeats: number;
  ticketTypes: TicketTypeInput[];
}
