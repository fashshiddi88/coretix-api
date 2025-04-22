export interface UserInput {
  name: string;
  email: string;
  password: string;
  referredBy?: string;
  role: "CUSTOMER" | "ORGANIZER";
}
export interface UserPayLoad {
  id: number;
  name: string;
  role: "CUSTOMER" | "ORGANIZER";
}

export interface EventInput {
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string; // ISO date string, misalnya: "2025-05-15T18:00:00.000Z"
  endDate: string; // ISO date string
  price: number;
  imageUrl: string;
  availableSeats: number;
}
