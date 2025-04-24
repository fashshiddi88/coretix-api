import { Request, Response } from "express";
import { TicketTypesService } from "../services/ticketType.service";

export class TicketTypesController {
  private ticketService: TicketTypesService;

  constructor() {
    this.ticketService = new TicketTypesService();
  }

  public async findByEventId(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.eventId);
      const tickets = await this.ticketService.findByEventId(eventId);
      res.status(200).json({ tickets });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch tickets",
        detail: error,
      });
    }
  }

  public async createBulk(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.eventId);
      const tickets = req.body;

      const result = await this.ticketService.createBulk(eventId, tickets);
      res.status(201).json({
        message: "Tickets created",
        tickets: result,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create tickets",
        detail: error,
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const ticket = await this.ticketService.update(id, data);

      res.status(200).json({
        message: "Ticket updated",
        detail: ticket,
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
      const ticket = await this.ticketService.delete(id);
      res.status(200).json({ message: "Ticket deleted", ticket });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete ticket",
        detail: error,
      });
    }
  }
}
