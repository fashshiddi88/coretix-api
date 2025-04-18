import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export class AuthRouter {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.routes();
  }

  private routes(): void {
    this.router.post(
      "/auth/login",
      this.authController.login.bind(this.authController)
    );
  }
}
