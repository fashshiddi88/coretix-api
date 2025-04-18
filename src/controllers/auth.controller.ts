import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      if (typeof result === "string") {
        res.status(401).json({ message: result });
        return;
      }
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        message: "Unauthorized: Failed login",
        error: error,
      });
    }
  }
}
