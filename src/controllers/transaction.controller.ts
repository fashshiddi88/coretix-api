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

  // Accept
  public async acceptTransaction(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const organizerId = (req as any).user?.id;

      const result = await this.transactionService.acceptTransaction(
        id,
        organizerId
      );
      res.status(200).json({ message: "Transaction accepted", detail: result });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Failed to accept transaction", detail: error });
    }
  }

  // Reject
  public async rejectTransaction(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const organizerId = (req as any).user?.id;

      const result = await this.transactionService.rejectTransaction(
        id,
        organizerId
      );
      res.status(200).json({ message: "Transaction rejected", detail: result });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Failed to reject transaction", detail: error });
    }
  }

  public async getAllTransaction(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user?.id;

      // Ambil query dan konversi ke tipe yang sesuai
      const query: TransactionQuery & {
        status?: TransactionStatus;
        eventId?: number;
      } = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        status: req.query.status as TransactionStatus,
        eventId: req.query.eventId
          ? parseInt(req.query.eventId as string)
          : undefined,
      };

      const result = await this.transactionService.getAllTransaction(
        query,
        organizerId
      );

      res.status(200).json({
        message: "Successfully retrieved transactions",
        detail: result,
      });
    } catch (error) {
      console.error("Get All Transaction Error:", error);
      res.status(500).json({
        message: "Failed to retrieve transactions",
        detail: error,
      });
    }
  }
}
