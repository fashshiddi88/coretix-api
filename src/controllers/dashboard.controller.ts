import { Request, Response } from "express";
import { TransactionStatus } from "@prisma/client";
import { TransactionQuery } from "../models/interface";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  public async getBasicStatistics(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user.id;
      const period = req.query.period as "day" | "month" | "year";
      const year = parseInt(req.query.year as string);
      const month = req.query.month
        ? parseInt(req.query.month as string)
        : undefined;

      if (!period || !["day", "month", "year"].includes(period) || !year) {
        res.status(400).json({ message: "Invalid query parameters" });
      }

      const result = await this.dashboardService.getBasicStatistics({
        organizerId,
        period,
        year,
        month,
      });

      res.status(200).json({ message: "Statistics retrieved", detail: result });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to get statistics", detail: error });
    }
  }

  // Transaction List
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

      const result = await this.dashboardService.getAllTransaction(
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

  // Accept
  public async acceptTransaction(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const organizerId = (req as any).user?.id;

      const result = await this.dashboardService.acceptTransaction(
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

      const result = await this.dashboardService.rejectTransaction(
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

  // Attendess list
  public async getAttendees(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.eventId);

      const attendees = await this.dashboardService.getAttendees(eventId);

      res.status(200).json({
        message: "Attendee list fetched successfully",
        data: attendees,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch attendee list",
        detail: error,
      });
    }
  }
}
