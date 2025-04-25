import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export function checkOwnership(paramName: "id" | "eventId") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const eventId = Number(req.params[paramName]);
    const userIdFromToken = (req as any).user?.id;

    if (!eventId) {
      res.status(400).json({ message: "Invalid or missing event ID" });
      return;
    }

    try {
      const event = await prisma.event.findUnique({ where: { id: eventId } });

      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      if (event.organizerId !== userIdFromToken) {
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
