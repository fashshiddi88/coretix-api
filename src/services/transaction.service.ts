import { prisma } from "../prisma/client";
import { TransactionStatus } from "@prisma/client";

export class TransactionService {
  public async create(data: {
    userId: number;
    ticketTypeId: number;
    promotionCode?: string;
    voucherCode?: string;
    pointsUsed?: number;
  }) {
    const ticket = await prisma.ticketType.findUnique({
      where: { id: data.ticketTypeId },
    });

    if (!ticket) throw new Error("Ticket type not found");

    if (ticket.availableQty < 1) {
      throw new Error("Ticket is sold out");
    }

    const eventId = ticket.eventId;

    let finalPrice = ticket.price;
    let promotionId: number | undefined;
    let voucherId: string | undefined;

    // Handle promotion
    if (data.promotionCode) {
      const promo = await prisma.promotion.findUnique({
        where: { code: data.promotionCode },
      });

      if (!promo || promo.eventId !== eventId) {
        throw new Error("Invalid or mismatched promotion");
      }

      finalPrice -= promo.amount;
      promotionId = promo.id;
    }

    // Handle voucher
    if (data.voucherCode) {
      const userVoucher = await prisma.userVoucher.findFirst({
        where: {
          userId: data.userId,
          voucherId: data.voucherCode,
        },
      });

      if (!userVoucher) {
        throw new Error("Voucher not found for this user");
      }

      const voucher = await prisma.voucher.findUnique({
        where: { code: data.voucherCode },
      });

      if (!voucher || (voucher.eventId && voucher.eventId !== eventId)) {
        throw new Error("Invalid voucher");
      }

      finalPrice -= voucher.discount;
      voucherId = voucher.code;
    }

    // Use points
    const pointsUsed = data.pointsUsed ?? 0;
    finalPrice -= pointsUsed;

    finalPrice = Math.max(finalPrice, 0);

    const transaction = await prisma.$transaction(async (tx) => {
      const trx = await tx.transaction.create({
        data: {
          userId: data.userId,
          eventId,
          ticketTypeId: data.ticketTypeId,
          quantity: 1,
          totalPrice: finalPrice,
          status: TransactionStatus.WAITING_PAYMENT,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          promotionId,
          voucherId,
          pointsUsed,
        },
      });

      await tx.ticketType.update({
        where: { id: data.ticketTypeId },
        data: { availableQty: { decrement: 1 } },
      });

      if (pointsUsed > 0) {
        await tx.user.update({
          where: { id: data.userId },
          data: { points: { decrement: pointsUsed } },
        });
      }

      if (voucherId) {
        await tx.userVoucher.deleteMany({
          where: {
            userId: data.userId,
            voucherId,
          },
        });
      }

      if (promotionId) {
        await tx.promotion.update({
          where: { id: promotionId },
          data: { used: { increment: 1 } },
        });
      }

      return trx;
    });

    return transaction;
  }
}
