import { Router } from "express";
import { PromotionController } from "../controllers/promotion.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { checkOwnership } from "../middlewares/checkOwnership.middleware";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware";

import { promoSchema } from "../lib/validations/validation.schema";

export class PromotionRouter {
  public router: Router;
  private promotionController: PromotionController;

  constructor() {
    this.router = Router();
    this.promotionController = new PromotionController();
    this.routes();
  }

  private routes(): void {
    this.router.get(
      "/event/:eventId/voucher_promotion",
      this.promotionController.findByEventId.bind(this.promotionController)
    );
    //add Promotion
    this.router.post(
      "/event/:eventId/voucher_promotion",
      AuthenticationMiddleware.verifyToken,
      checkOwnership("eventId"),
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      ValidationMiddleware.validate({ body: promoSchema.array }),
      this.promotionController.createBulk.bind(this.promotionController)
    );

    this.router.put(
      "/event/voucher_promotion/:id",
      AuthenticationMiddleware.verifyToken,
      checkOwnership("id"),
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      ValidationMiddleware.validate({
        body: promoSchema.body.partial(),
        params: promoSchema.params,
        partial: true,
      }),
      this.promotionController.update.bind(this.promotionController)
    );
    this.router.delete(
      "/event/voucher_promotion/:id",
      AuthenticationMiddleware.verifyToken,
      checkOwnership("id"),
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      ValidationMiddleware.validate({
        params: promoSchema.params,
      }),
      this.promotionController.delete.bind(this.promotionController)
    );
  }
}
