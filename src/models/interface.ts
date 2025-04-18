export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "ORGANIZER";
}
export interface UserPayLoad {
  id: number;
  name: string;
  role: "CUSTOMER" | "ORGANIZER";
}
