import { prisma } from "../prisma/client";
import { comparePassword, hashPassword } from "../lib/utils/password.helper";

export class ProfileService {
  public async updateProfile(
    userId: number,
    data: { name?: string; profileImage?: string },
    file?: Express.Multer.File
  ) {
    const updateData = { ...data };

    if (file?.path) {
      updateData.profileImage = file.path; // ✅ simpan URL/path ke profileImage
    }
    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  public async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Old password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);

    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
