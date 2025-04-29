import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";

import { authSchema } from "../lib/validations/validation.schema";

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
    this.router.post(
      "/auth/forgot-password",
      ValidationMiddleware.validate({ body: authSchema.forgotPassword }),
      this.authController.forgotPassword.bind(this.authController)
    );

    this.router.post(
      "/auth/reset-password",
      ValidationMiddleware.validate({ body: authSchema.resetPassword }),
      this.authController.resetPassword.bind(this.authController)
    );
  }
}
