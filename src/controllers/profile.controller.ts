import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }
  public async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name } = req.body;
      const file = req.file;

      const updatedUser = await this.profileService.updateProfile(
        userId,
        { name },
        file
      );

      res.status(200).json({
        message: "Profile updated successfully",
        detail: updatedUser,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update profile",
        detail: error,
      });
    }
  }

  public async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // ambil dari token
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          message: "Old password and new password are required",
        });
      }

      const newPass = await this.profileService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      res.status(200).json({
        message: "Password changed successfully",
        detail: newPass,
      });
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }

  public async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const user = await this.profileService.getProfile(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res
        .status(200)
        .json({ message: "Profile fetched successfully", detail: user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to fetch profile", detail: error });
    }
  }
}
