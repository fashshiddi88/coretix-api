import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";

import { userSchema } from "../lib/validations/validation.schema";

export class UserRouter {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.routes();
  }

  private routes(): void {
    this.router.post(
      "/register",
      ValidationMiddleware.validate({ body: userSchema.body }),
      this.userController.create.bind(this.userController)
    );

    this.router.put(
      "/profile/:id",
      AuthenticationMiddleware.verifyToken,
      ValidationMiddleware.validate({
        body: userSchema.body,
        params: userSchema.params,
        partial: true,
      }),
      this.userController.update.bind(this.userController)
    );
  }
}
