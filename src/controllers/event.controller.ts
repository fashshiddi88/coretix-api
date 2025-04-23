import { Request, Response } from "express";
import { EventService } from "../services/event.service";
import { EventQuery } from "../models/interface";

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

      const {
        title,
        description,
        category,
        location,
        imageUrl,
        price,
        availableSeats,
        startDate,
        endDate,
        ticketTypes,
      } = req.body;

      const event = await this.eventService.create(
        {
          title,
          description,
          category,
          location,
          imageUrl,
          price,
          availableSeats,
          startDate,
          endDate,
          ticketTypes,
        },
        organizerId
      );

      res.status(201).json({
        message: "Event created successfully",
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

  public async findAll(req: Request, res: Response): Promise<void> {
    try {
      const query: EventQuery = {
        search: req.query.search as string,
        category: req.query.category as string,
        location: req.query.location as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };
      const result = await this.eventService.findAll(query);
      res.status(200).json({
        message: "Event list fetched successfully",
        detail: result.events,
        total: result.total,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch Events",
        detail: error,
      });
    }
  }
}
