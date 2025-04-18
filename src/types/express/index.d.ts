import { UserPayLoad } from "../../models/interface";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayLoad;
    }
  }
}
