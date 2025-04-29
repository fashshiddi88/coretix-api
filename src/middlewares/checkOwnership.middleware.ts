import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export function checkOwnership(paramName: "id" | "eventId") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const paramValue = Number(req.params[paramName]);
    const userIdFromToken = (req as any).user?.id;

    if (!paramValue) {
      res.status(400).json({ message: "Invalid or missing ID" });
      return;
    }

    try {
      let eventId: number | null = null;

      if (paramName === "eventId") {
        eventId = paramValue;
      } else if (paramName === "id") {
        // Cek dari TicketType
        const ticketType = await prisma.ticketType.findUnique({
          where: { id: paramValue },
        });
        if (ticketType) {
          eventId = ticketType.eventId;
        }

        // Cek dari Promotion
        if (!eventId) {
          const promotion = await prisma.promotion.findUnique({
            where: { id: paramValue },
          });
          if (promotion) {
            eventId = promotion.eventId;
          }
        }
      }

      if (!eventId) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      const event = await prisma.event.findUnique({ where: { id: eventId } });

      if (!event || event.organizerId !== userIdFromToken) {
        res.status(403).json({
          message: "Forbidden: You can only modify your own event",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
