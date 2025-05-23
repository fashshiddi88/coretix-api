import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware";
import { checkOwnership } from "../middlewares/checkOwnership.middleware";
import { uploadEventImage } from "../middlewares/upload.middleware";
import { parseMultipartBody } from "../middlewares/parseMultipartBody.middleware";

import { eventSchema } from "../lib/validations/validation.schema";

export class EventRouter {
  public router: Router;
  private eventController: EventController;

  constructor() {
    this.router = Router();
    this.eventController = new EventController();
    this.routes();
  }

  private routes(): void {
    this.router.get(
      "/events",
      this.eventController.findAll.bind(this.eventController)
    );
    this.router.get(
      "/event/:id",
      this.eventController.findById.bind(this.eventController)
    );
    this.router.post(
      "/create-event",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      uploadEventImage.single("image"),
      parseMultipartBody,
      ValidationMiddleware.validate({ body: eventSchema.body }),
      this.eventController.create.bind(this.eventController)
    );
    this.router.put(
      "/event/edit/:id",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      checkOwnership("id"),
      uploadEventImage.single("image"),
      ValidationMiddleware.validate({
        body: eventSchema.updateBody,
        params: eventSchema.params,
        partial: true,
      }),
      this.eventController.update.bind(this.eventController)
    );
  }
}
