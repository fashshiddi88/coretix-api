import { prisma } from "../prisma/client";
import { Promotion } from "@prisma/client";
import { PromotionInput } from "../models/interface";
import { Prisma } from "@prisma/client";

export class PromotionService {
  public async findByEventId(eventId: number): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: { eventId },
    });
  }

  public async createBulk(
    eventId: number,
    promotions: PromotionInput[]
  ): Promise<Promotion[]> {
    if (promotions.length === 0) return [];

    const data = promotions.map((promo) => ({
      ...promo,
      eventId,
    }));

    await prisma.promotion.createMany({ data });

    return this.findByEventId(eventId);
  }

  public async update(
    id: number,
    data: Partial<PromotionInput>
  ): Promise<Promotion> {
    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new Error("Promotion not found");

    return prisma.promotion.update({
      where: { id },
      data,
    });
  }

  public async delete(id: number): Promise<Promotion> {
    return prisma.promotion.delete({
      where: { id },
    });
  }
}
