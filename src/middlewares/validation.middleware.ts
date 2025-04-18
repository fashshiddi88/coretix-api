import { Request, Response, NextFunction } from "express";
import { ZodError, AnyZodObject } from "zod";

interface Validation {
  body?: AnyZodObject;
  params?: AnyZodObject;
  partial?: boolean;
}

export class ValidationMiddleware {
  static validate(schema: Validation) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (schema.body) {
          let bodySchema;
          if (schema.partial) {
            bodySchema = schema.body.partial();
          } else {
            bodySchema = schema.body;
          }
          req.body = bodySchema.parse(req.body);
        }
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
        }
      }
    };
  }
}
