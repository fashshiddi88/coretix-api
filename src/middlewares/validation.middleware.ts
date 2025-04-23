import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny, ZodObject } from "zod";

interface Validation {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  partial?: boolean;
}

export class ValidationMiddleware {
  static validate(schema: Validation) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Handle body validation
        if (schema.body) {
          let bodySchema = schema.body;

          // Only apply .partial() if it's a ZodObject
          if (schema.partial && bodySchema instanceof ZodObject) {
            bodySchema = bodySchema.partial();
          }

          req.body = bodySchema.parse(req.body);
        }

        // Handle params validation
        if (schema.params) {
          req.params = schema.params.parse(req.params);
        }

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            status: "error",
            errors: error.errors,
          });
        } else {
          console.error("Unexpected validation error:", error);
          res.status(500).json({
            status: "error",
            message: "Internal server error during validation",
          });
        }
      }
    };
  }
}
