import { Request, Response } from "express";
import { EventService } from "../services/event.service";

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user?.id;
      const role = (req as any).user?.role;

      if (role !== "ORGANIZER") {
        res.status(403).json({ message: "Only organizers can create events" });
        return;
      }

      const data = req.body;
      const event = await this.eventService.create(data, organizerId);

      res.status(201).json({
        message: "Event Created",
        detail: event,
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({
        message: "Failed to create event",
        detail: error,
      });
    }
  }
}
