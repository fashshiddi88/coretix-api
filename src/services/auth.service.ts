import { JwtUtils } from "../lib/token.config";
import { prisma } from "../prisma/client";
import bcrypt, { hash } from "bcrypt";

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
}
