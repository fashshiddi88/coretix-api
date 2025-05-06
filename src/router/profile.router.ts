import { Router } from "express";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { ProfileController } from "../controllers/profile.controller";
import { uploadProfileImage } from "../middlewares/upload.middleware";

export class ProfileRouter {
  public router: Router;
  private profileController: ProfileController;

  constructor() {
    this.router = Router();
    this.profileController = new ProfileController();
    this.routes();
  }

  private routes(): void {
    this.router.put(
      "/profile",
      AuthenticationMiddleware.verifyToken,
      uploadProfileImage.single("image"),
      this.profileController.updateProfile.bind(this.profileController)
    );
    this.router.patch(
      "/profile/change-password",
      AuthenticationMiddleware.verifyToken,
      this.profileController.changePassword.bind(this.profileController)
    );
    this.router.get(
      "/profile",
      AuthenticationMiddleware.verifyToken,
      this.profileController.getProfile.bind(this.profileController)
    );
  }
}
