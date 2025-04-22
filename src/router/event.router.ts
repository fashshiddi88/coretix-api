import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";

export class EventRouter {
  public router: Router;
  private eventController: EventController;

  constructor() {
    this.router = Router();
    this.eventController = new EventController();
    this.routes();
  }

  private routes(): void {
    this.router.post(
      "/create-event",
      AuthenticationMiddleware.verifyToken,
      this.eventController.create.bind(this.eventController)
    );
  }
}
