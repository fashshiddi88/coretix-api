import { Request, Response, NextFunction } from "express";
import { JwtUtils } from "../lib/token.config";

export class AuthenticationMiddleware {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
          message: "Unauthorized: no token provided",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = JwtUtils.verifyToken(token) as any;
      (req as any).user = decoded;
      return next();
    } catch (error) {
      return res.status(500).json({
        message: "Unauthorized: invalid token",
      });
    }
  }
}
