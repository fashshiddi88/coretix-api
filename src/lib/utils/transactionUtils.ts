import { Prisma, Transaction } from "@prisma/client";

export async function restoreResources(
  prisma: Prisma.TransactionClient,
  trx: Transaction
) {
  // Restore kuota tiket
  await prisma.ticketType.update({
    where: { id: trx.ticketTypeId },
    data: { availableQty: { increment: trx.quantity } },
  });

  // Restore poin
  if (trx.pointsUsed > 0) {
    await prisma.user.update({
      where: { id: trx.userId },
      data: { points: { increment: trx.pointsUsed } },
    });
  }

  // Restore voucher
  if (trx.voucherId) {
    const voucher = await prisma.voucher.findUnique({
      where: { code: trx.voucherId },
    });

    const now = new Date();
    if (voucher && voucher.endDate > now) {
      await prisma.userVoucher.create({
        data: {
          userId: trx.userId,
          voucherId: trx.voucherId,
          expiresAt: voucher.endDate,
        },
      });
    }
  }

  // Restore promotion usage
  if (trx.promotionId) {
    await prisma.promotion.update({
      where: { id: trx.promotionId },
      data: {
        used: { decrement: 1 },
      },
    });
  }
}
