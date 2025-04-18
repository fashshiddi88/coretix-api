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

    // sebelum dicompare, hash dulu
    const hashedPassword = (await hash(password, 10)) as any;

    // kalau udah terdaftar, cek lagi passwordnya
    const isValid = await bcrypt.compare(user.password, hashedPassword);

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
