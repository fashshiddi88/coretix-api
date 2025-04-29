import { Request, Response } from "express";
import { PromotionService } from "../services/promotion.service";

export class PromotionController {
  private promotionService: PromotionService;

  constructor() {
    this.promotionService = new PromotionService();
  }

  public async findByEventId(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.eventId);
      const promotions = await this.promotionService.findByEventId(eventId);
      res.status(200).json({ promotions });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch voucher promotion",
        detail: error,
      });
    }
  }

  public async createBulk(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.eventId);
      const promotions = req.body;

      const result = await this.promotionService.createBulk(
        eventId,
        promotions
      );
      res.status(201).json({
        message: "Voucher promotion created",
        promotion: result,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create voucher promotion",
        detail: error,
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const result = await this.promotionService.update(id, data);

      res.status(200).json({
        message: "Voucher promotion updated",
        detail: result,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update ticket",
        detail: error,
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const promotion = await this.promotionService.delete(id);
      res.status(200).json({ message: "Voucher promotion deleted", promotion });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete Voucher promotion",
        detail: error,
      });
    }
  }
}
