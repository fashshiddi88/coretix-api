import { prisma } from "../prisma/client";
import { UserInput } from "../models/interface";
import { generateReferralCode } from "../lib/utils/generateReferralCode";
import { hashPassword } from "../lib/utils/password.helper";
import { ReferralService } from "./refferal.service";

const referralService = new ReferralService();
export class UserService {
  public async create(data: UserInput) {
    // generate referral code
    let referralCode: string | undefined = undefined;

    if (data.role !== "CUSTOMER" && data.referredBy) {
      throw new Error("Only customers can use referral codes.");
    }

    // HANYA CUSTOMER yang boleh dapat referralCode
    if (data.role === "CUSTOMER") {
      let isUnique = false;

      while (!isUnique) {
        referralCode = generateReferralCode(data.name);
        const existing = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (!existing) isUnique = true;
      }
    }

    const hashedPassword = await hashPassword(data.password);

    // Kalau BUKAN CUSTOMER, hapus referredBy
    if (data.role !== "CUSTOMER") {
      delete data.referredBy;
    }

    // create user dulu
    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        referralCode,
      },
    });

    // HANYA CUSTOMER yang jalanin logic referral
    if (data.role === "CUSTOMER" && data.referredBy) {
      await referralService.handleReferral(newUser, data.referredBy);
    }

    // fetch ulang user untuk ambil data terbaru (termasuk referredBy yang sudah diupdate)
    const finalUser = await prisma.user.findUnique({
      where: { id: newUser.id },
    });

    return finalUser;
  }

  public async update(id: number, data: Partial<UserInput>) {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }
}
