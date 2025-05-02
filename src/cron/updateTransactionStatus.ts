import { prisma } from "../prisma/client";
import { TransactionStatus } from "@prisma/client";
import { restoreResources } from "../lib/utils/transactionUtils";

export async function updateTransactionStatuses() {
  const now = new Date();

  // ✅ EXPIRED jika lewat 2 jam tanpa bayar
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_PAYMENT,
      expiresAt: { lt: now },
    },
  });

  for (const trx of expiredTransactions) {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: trx.id },
        data: { status: TransactionStatus.EXPIRED },
      });

      await restoreResources(tx, trx);
    });
  }

  // ✅ CANCELLED jika tidak dikonfirmasi dalam 3 hari
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const staleTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_CONFIRMATION,
      createdAt: { lt: threeDaysAgo },
    },
  });

  for (const trx of staleTransactions) {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: trx.id },
        data: { status: TransactionStatus.CANCELED },
      });

      await restoreResources(tx, trx);
    });
  }
}
