import { prisma } from "../prisma/client";
import { generateVoucherCode } from "../lib/utils/generateVoucherCode";
import { User } from "@prisma/client";

export class ReferralService {
  public async handleReferral(user: User, referredBy?: string): Promise<void> {
    //console.log("handleReferral called");
    //console.log("ReferredBy input:", referredBy);
    //console.log("User created:", user);

    if (!referredBy) {
      //console.log("No referral code provided.");
      return;
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: referredBy },
    });

    //console.log("Referrer found:", referrer);

    if (!referrer) {
      //console.log("Referrer not found with code:", referredBy);
      return;
    }

    // Update referredBy field di user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { referredBy },
    });

    //console.log("User updated with referredBy:", updatedUser);

    // Tambahkan 10.000 poin ke referrer
    const updatedReferrer = await prisma.user.update({
      where: { id: referrer.id },
      data: {
        points: referrer.points + 10_000,
      },
    });

    //console.log("Referrer updated with bonus points:", updatedReferrer);

    // Simpan ke tabel reward log
    await prisma.referralReward.create({
      data: {
        userId: referrer.id,
        points: 10_000,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    //console.log("ReferralReward record created");

    // Buat voucher global
    const voucherCode = generateVoucherCode();

    await prisma.voucher.create({
      data: {
        code: voucherCode,
        discount: 10000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        eventId: null,
      },
    });

    //console.log("Voucher created with code:", voucherCode);

    await prisma.userVoucher.create({
      data: {
        userId: user.id,
        voucherId: voucherCode,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    //console.log("Voucher linked to new user");
  }
}
