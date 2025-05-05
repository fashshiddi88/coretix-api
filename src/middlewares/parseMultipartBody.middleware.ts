import { Request, Response, NextFunction } from "express";

export function parseMultipartBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const fieldsToParse = ["price", "availableSeats"];
    const jsonFields = ["ticketTypes", "promotions"];

    // Ubah string angka jadi number
    fieldsToParse.forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = Number(req.body[key]);
      }
    });

    // Ubah string JSON jadi array/objek
    jsonFields.forEach((key) => {
      if (typeof req.body[key] === "string") {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch (error) {
          console.warn(`⚠️ Failed to parse JSON for field ${key}:`, error);
        }
      }
    });

    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid request body", detail: error });
  }
}
