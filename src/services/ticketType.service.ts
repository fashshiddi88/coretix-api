import { prisma } from "../prisma/client";
import { TicketType } from "@prisma/client";
import { TicketTypeInput } from "../models/interface";
import { Prisma } from "@prisma/client";

export class TicketTypesService {
  public async findByEventId(eventId: number): Promise<TicketType[]> {
    return prisma.ticketType.findMany({
      where: { eventId },
    });
  }

  public async createBulk(
    eventId: number,
    tickets: TicketTypeInput[]
  ): Promise<TicketType[]> {
    if (tickets.length === 0) return [];

    for (const ticket of tickets) {
      const data: Prisma.TicketTypeUncheckedCreateInput = {
        ...ticket,
        eventId,
        availableQty: ticket.totalQuantity,
      };

      await prisma.ticketType.create({ data });
    }

    return this.findByEventId(eventId);
  }

  public async update(
    id: number,
    data: Partial<TicketTypeInput>
  ): Promise<TicketType> {
    // Ambil tiket lama
    const oldTicket = await prisma.ticketType.findUnique({ where: { id } });
    if (!oldTicket) throw new Error("Ticket not found");

    const updateData: Partial<TicketTypeInput & { availableQty: number }> = {
      ...data,
    };

    if (data.totalQuantity !== undefined) {
      updateData.availableQty = data.totalQuantity;
    }

    return prisma.ticketType.update({
      where: { id },
      data: updateData,
    });
  }

  public async delete(id: number): Promise<TicketType> {
    return prisma.ticketType.delete({
      where: { id },
    });
  }
}
