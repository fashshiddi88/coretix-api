import { Router } from "express";
import { TicketTypesController } from "../controllers/ticketType.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { checkOwnership } from "../middlewares/checkOwnership.middleware";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware";
import { ticketSchema } from "../lib/validations/validation.schema";

export class TicketTypeRouter {
  public router: Router;
  private ticketTypeController: TicketTypesController;

  constructor() {
    this.router = Router();
    this.ticketTypeController = new TicketTypesController();
    this.routes();
  }

  private routes(): void {
    this.router.get(
      "/event/:eventId/ticket",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      this.ticketTypeController.findByEventId.bind(this.ticketTypeController)
    );
    //add tiket
    this.router.post(
      "/event/:eventId/ticket",
      AuthenticationMiddleware.verifyToken,
      checkOwnership("eventId"),
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      ValidationMiddleware.validate({ body: ticketSchema.array }),
      this.ticketTypeController.createBulk.bind(this.ticketTypeController)
    );
    this.router.put(
      "/event/ticket/:id",
      AuthenticationMiddleware.verifyToken,
      checkOwnership("eventId"),
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      ValidationMiddleware.validate({
        body: ticketSchema.body.partial(),
        params: ticketSchema.params,
        partial: true,
      }),
      this.ticketTypeController.update.bind(this.ticketTypeController)
    );
    this.router.delete(
      "/event/ticket/:id",
      AuthenticationMiddleware.verifyToken,
      checkOwnership("eventId"),
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      ValidationMiddleware.validate({
        params: ticketSchema.params,
      }),
      this.ticketTypeController.delete.bind(this.ticketTypeController)
    );
  }
}
