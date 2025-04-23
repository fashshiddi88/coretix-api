import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
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
    this.router.post(
      "/create-event",
      AuthenticationMiddleware.verifyToken,
      ValidationMiddleware.validate({ body: eventSchema.body }),
      this.eventController.create.bind(this.eventController)
    );
    this.router.put(
      "/event/edit/:id",
      AuthenticationMiddleware.verifyToken,
      ValidationMiddleware.validate({
        body: eventSchema.updateBody,
        params: eventSchema.params,
        partial: true,
      }),
      this.eventController.update.bind(this.eventController)
    );
  }
}
