import { prisma } from "../prisma/client";
import { TransactionStatus } from "@prisma/client";
import { restoreResources } from "../lib/utils/transactionUtils";

export class TransactionService {
  public async create(data: {
    userId: number;
    ticketTypeId: number;
    promotionCode?: string;
    voucherCode?: string;
    usePoints?: boolean;
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
    let pointsUsed = 0;

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

    // Use all user points if requested
    if (data.usePoints) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      pointsUsed = Math.min(user.points, finalPrice);
      finalPrice -= pointsUsed;
    }

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

  public async uploadPaymentProof({
    transactionId,
    userId,
    fileUrl,
  }: {
    transactionId: number;
    userId: number;
    fileUrl: string;
  }) {
    const trx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!trx || trx.userId !== userId) {
      throw new Error("Transaction not found or unauthorized");
    }

    if (trx.status !== "WAITING_PAYMENT") {
      throw new Error(
        "Cannot upload payment proof in current transaction status"
      );
    }

    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: fileUrl,
        status: "WAITING_CONFIRMATION",
        autoCanceledAt: threeDaysLater,
      },
    });

    return updated;
  }

  // Menerima transaksi
  public async acceptTransaction(transactionId: number, organizerId: number) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { event: true },
    });

    if (!transaction) throw new Error("Transaction not found");
    if (transaction.event.organizerId !== organizerId)
      throw new Error("Unauthorized");

    if (transaction.status !== "WAITING_CONFIRMATION")
      throw new Error(
        "Only transactions waiting for confirmation can be accepted"
      );

    return prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "DONE", confirmedAt: new Date() },
    });
  }

  // Menolak transaksi
  public async rejectTransaction(transactionId: number, organizerId: number) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        event: true,
      },
    });

    if (!transaction) throw new Error("Transaction not found");
    if (transaction.event.organizerId !== organizerId)
      throw new Error("Unauthorized");

    if (transaction.status !== "WAITING_CONFIRMATION")
      throw new Error(
        "Only transactions waiting for confirmation can be rejected"
      );

    return await prisma.$transaction(async (tx) => {
      // rollback resource
      await restoreResources(tx, transaction);

      // ubah status jadi REJECTED
      return await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "REJECTED", rejectedAt: new Date() },
      });
    });
  }
}
