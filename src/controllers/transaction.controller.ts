import { Request, Response } from "express";
import { TransactionStatus } from "@prisma/client";
import { TransactionService } from "../services/transaction.service";
import { TransactionQuery } from "../models/interface";

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

  public async uploadPaymentProof(req: Request, res: Response): Promise<void> {
    try {
      const transactionId = Number(req.params.id);
      const userId = (req as any).user?.id;
      const file = (req as any).file as Express.Multer.File;

      if (!file) {
        res.status(400).json({ message: "No file uploaded" });
      }

      const result = await this.transactionService.uploadPaymentProof({
        transactionId,
        userId,
        fileUrl: file.path,
      });

      res.status(200).json({
        message: "Payment proof uploaded successfully",
        detail: result,
      });
    } catch (error: any) {
      console.error("Upload payment proof error:", error);
      res.status(500).json({
        message: "Failed to upload payment proof",
        detail: error.message,
      });
    }
  }

  public async getUserTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
      }

      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        status: req.query.status as string | undefined,
      };

      const data = await this.transactionService.getUserTransactions(
        userId,
        query
      );

      res.json({ message: "Success", ...data });
    } catch (error) {
      res.status(500).json({ message: "Failed to get transactions", error });
    }
  }
}
