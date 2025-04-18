import jwt from "jsonwebtoken";
import { UserPayLoad } from "../models/interface";

export class JwtUtils {
  private static secret = process.env.JWT_SECRET as any;
  private static expiration = "7d" as any;

  static generateToken(payload: UserPayLoad) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiration });
  }
  static verifyToken(token: string) {
    return jwt.verify(token, this.secret) as UserPayLoad;
  }
}
