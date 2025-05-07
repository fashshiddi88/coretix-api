import { prisma } from "../prisma/client";
import { TransactionStatus } from "@prisma/client";
import { TransactionQuery } from "../models/interface";
import { restoreResources } from "../lib/utils/transactionUtils";
import { StatisticsQuery } from "../models/interface";

export class DashboardService {
  public async getBasicStatistics(query: StatisticsQuery) {
    const { organizerId, period, year, month } = query;

    const parsedYear = Number(year);
    const parsedMonth = month ? Number(month) - 1 : undefined;

    if (isNaN(parsedYear) || (month && isNaN(parsedMonth!))) {
      throw new Error("Invalid year or month value");
    }

    const startDate = new Date(parsedYear, parsedMonth ?? 0, 1);
    const endDate =
      period === "day"
        ? new Date(parsedYear, (parsedMonth ?? 0) + 1, 1) // next month
        : new Date(parsedYear + 1, 0, 1); // next year

    const transactions = await prisma.transaction.findMany({
      where: {
        status: "DONE",
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        event: {
          organizerId,
        },
      },
      include: {
        ticketType: true,
      },
    });

    const groupByKey = (date: Date) => {
      const d = new Date(date);
      if (period === "day") return d.getDate();
      if (period === "month") return d.getMonth() + 1;
      return d.getFullYear();
    };

    const result: Record<string, { income: number; tickets: number }> = {};
    for (const trx of transactions) {
      const key = groupByKey(trx.createdAt).toString();
      if (!result[key]) result[key] = { income: 0, tickets: 0 };
      result[key].income += trx.totalPrice;
      result[key].tickets += trx.quantity;
    }

    return result;
  }

  //Transaction List
  public async getAllTransaction(
    query: TransactionQuery & { status?: TransactionStatus; eventId?: number },
    organizerId: number
  ) {
    const { page = 1, limit = 10, status, eventId } = query;

    const where: any = {
      ticketType: {
        event: {
          organizerId: organizerId,
          ...(eventId && { id: eventId }),
        },
      },
      ...(status && { status }),
    };

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        user: true,
        ticketType: {
          include: { event: true },
        },
      },
    });

    return {
      transactions,
      total,
    };
  }

  // ACC transaksi
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

  // Reject transaksi
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

  // Attendess list
  public async getAttendees(eventId: number) {
    const attendees = await prisma.transaction.findMany({
      where: {
        eventId,
        status: "DONE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return attendees.map((trx) => ({
      userId: trx.user.id,
      name: trx.user.name,
      email: trx.user.email,
      quantity: trx.quantity,
      totalPrice: trx.totalPrice,
      purchasedAt: trx.createdAt,
    }));
  }
}
