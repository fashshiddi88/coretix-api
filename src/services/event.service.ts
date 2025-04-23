import { prisma } from "../prisma/client";
import { EventInput, EventQuery } from "../models/interface";

export class EventService {
  public async create(data: EventInput, organizerId: number) {
    return await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          imageUrl: data.imageUrl,
          price: data.price,
          availableSeats: data.availableSeats,
          startDate: data.startDate,
          endDate: data.endDate,
          organizerId,
        },
      });

      const ticketsData = data.ticketTypes.map((ticket) => ({
        ...ticket,
        eventId: event.id,
        availableQty: ticket.totalQuantity,
      }));

      await tx.ticketType.createMany({
        data: ticketsData,
      });

      // Ambil event lengkap dengan relasi ticketTypes
      const fullEvent = await tx.event.findUnique({
        where: { id: event.id },
        include: {
          ticketTypes: true,
        },
      });

      return fullEvent;
    });
  }

  public async findAll(query: EventQuery) {
    const { search, category, location, page = 1, limit = 10 } = query;
    const where: any = {};

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = location;
    }

    const total = await prisma.event.count({ where });

    return {
      events: await prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: "asc" },
      }),
      total,
    };
  }

  public async update(id: number, data: Partial<EventInput>) {
    const { ticketTypes, ...eventData } = data;

    return await prisma.event.update({
      where: { id },
      data: eventData,
      include: {
        ticketTypes: true,
      },
    });
  }
}
