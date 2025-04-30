import { Router } from "express";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware";
import { TransactionController } from "../controllers/transaction.controller";

export class TransactionRouter {
  public router: Router;
  private transactionController: TransactionController;

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();
    this.routes();
  }

  private routes(): void {
    this.router.post(
      "/transactions/:ticketTypeId",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("CUSTOMER"),
      this.transactionController.create.bind(this.transactionController)
    );
  }
}
