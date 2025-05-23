import { Router } from "express";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import { TransactionController } from "../controllers/transaction.controller";

import { createTransactionSchema } from "../lib/validations/validation.schema";
import { upload } from "../middlewares/upload.middleware";
import { ticketTypeParamSchema } from "../lib/validations/validation.schema";

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
      "/transactions",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("CUSTOMER"),
      ValidationMiddleware.validate({
        body: createTransactionSchema,
      }),
      this.transactionController.create.bind(this.transactionController)
    );

    this.router.get(
      "/transactions/:id",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("CUSTOMER"),
      this.transactionController.getTransactionById.bind(
        this.transactionController
      )
    );

    this.router.post(
      "/transactions/:id/payment-proof",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("CUSTOMER"),
      upload.single("file"), // Upload 1 file dengan field name "file"
      this.transactionController.uploadPaymentProof.bind(
        this.transactionController
      )
    );

    this.router.get(
      "/my-transactions",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("CUSTOMER"),
      this.transactionController.getUserTransactions.bind(
        this.transactionController
      )
    );
  }
}
