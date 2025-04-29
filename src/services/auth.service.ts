import { JwtUtils } from "../lib/token.config";
import { prisma } from "../prisma/client";
import bcrypt, { hash } from "bcrypt";
import { sendMail } from "../lib/nodemailer.config";
import { hashPassword } from "../lib/utils/password.helper";

export class AuthService {
  public async login(email: string, password: string) {
    //pengecekan apakah user sudah terdaftar
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    //pengecekan pertama kalau gagal tolak
    if (!user) {
      return "Invalid email or password";
    }

    // compare password plain dari user dengan hashed password di database
    const isValid = await bcrypt.compare(password, user.password);

    // pengecekan kedua : kalau gagal ditolak
    if (!isValid) {
      return "Invalid credentials";
    }

    // tukar dengan token
    const token = JwtUtils.generateToken({
      id: user.id,
      name: user.name,
      role: user.role as any,
    });

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      access_token: token,
    };
  }

  public async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Email not found");
    }

    const resetToken = JwtUtils.generateToken(
      { id: user.id, email: user.email },
      "15m" // token expire 15 menit
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested to reset your password.</p>
        <p>Click this link to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return { message: "Password reset email sent" };
  }

  public async resetPassword(token: string, newPassword: string) {
    const decoded = JwtUtils.verifyToken(token); // verify dulu

    if (!decoded || !decoded.id) {
      throw new Error("Invalid or expired token");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return { message: "Password has been reset successfully" };
  }
}
