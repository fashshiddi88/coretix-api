import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const transaction = await this.transactionService.create({
        userId,
        ticketTypeId: req.body.ticketTypeId,
        promotionCode: req.body.promotionCode,
        voucherCode: req.body.voucherCode,
        usePoints: req.body.usePoints ?? false,
      });

      res.status(201).json({
        message: "Transaction created!",
        detail: transaction,
      });
    } catch (error: any) {
      console.error("Create event error:", error);
      res.status(500).json({
        message: "Failed to create transaction",
        detail: error,
      });
    }
  }
}
