import { Request, Response } from "express";
import { EventService } from "../services/event.service";
import { EventQuery } from "../models/interface";
import { prisma } from "../prisma/client";

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user?.id;
      const role = (req as any).user?.role;
      const file = req.file;

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
        promotions,
      } = req.body;

      const event = await this.eventService.create(
        {
          title,
          description,
          category,
          location,
          imageUrl,
          price: Number(price),
          availableSeats: Number(availableSeats),
          startDate,
          endDate,
          ticketTypes,
          promotions,
        },
        organizerId,
        file
      );

      res.status(201).json({
        message: "Event created successfully",
        detail: event,
      });
    } catch (error) {
      console.error("Create event error:", error);

      res.status(500).json({
        message: "Failed to create event",
        detail: error instanceof Error ? error.message : error,
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

  public async findById(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.id);
      const event = await this.eventService.findById(eventId);
      res.status(200).json({
        message: "Event details fetched successfully",
        detail: event,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch Event details",
        detail: error,
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.id);
      const userIdFromToken = (req as any).user?.id;
      const file = req.file;

      // Pastikan ID valid
      if (isNaN(eventId)) {
        res.status(400).json({ message: "Invalid event ID" });
        return;
      }

      // Cari event-nya
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      // Event tidak ditemukan
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      // Cek apakah user adalah pemilik event
      if (event.organizerId !== userIdFromToken) {
        res.status(403).json({
          message: "Forbidden: You can only update your own event",
        });
        return;
      }

      const { ticketTypes, promotions, ...eventData } = req.body;
      const result = await this.eventService.update(
        eventId,
        {
          ...eventData,
          ticketTypes: ticketTypes ? JSON.parse(ticketTypes) : undefined,
          promotions: promotions ? JSON.parse(promotions) : undefined,
        },
        file
      );

      res.status(200).json({
        message: "Event Updated",
        detail: result,
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({
        message: "Failed to update event",
        detail: error,
      });
    }
  }
}
