import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UserInput } from "../models/interface";
import { prisma } from "../prisma/client";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const data: UserInput = req.body;
      const result = await this.userService.create(data);
      res.status(201).json({
        message: "User Created",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create user",
        detail: error,
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: Partial<UserInput> = req.body;

      const userIdFromToken = (req as any).user?.id;

      if (Number(id) !== userIdFromToken) {
        res.status(403).json({
          message: "Forbidden: You can only update your own profile",
        });
        return;
      }

      const result = await this.userService.update(Number(id), data);

      res.status(200).json({
        message: "Profile Updated",
        detail: result,
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({
        message: "Failed to update profile",
        detail: error,
      });
    }
  }
}
