import { prisma } from "../prisma/client";
import { EventInput, EventQuery } from "../models/interface";

export class EventService {
  public async create(
    data: EventInput,
    organizerId: number,
    file?: Express.Multer.File
  ) {
    return await prisma.$transaction(async (tx) => {
      let imageUrl = data.imageUrl || "";
      if (file && file.path) {
        imageUrl = file.path;
      } else if (file && !file.path) {
        throw new Error("File uploaded but Cloudinary URL is missing.");
      }

      const event = await tx.event.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          imageUrl: imageUrl,
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

      // tambah promotion jika ada
      if (data.promotions && data.promotions.length > 0) {
        const promotionsData = data.promotions.map((promo) => ({
          ...promo,
          eventId: event.id,
        }));
        await tx.promotion.createMany({ data: promotionsData });
      }

      // Ambil event lengkap
      const fullEvent = await tx.event.findUnique({
        where: { id: event.id },
        include: {
          ticketTypes: true,
          promotions: true,
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

  // Menampilkan detail event berdasarkan ID
  public async findById(id: number) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        promotions: true,
        organizer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  }

  public async update(
    id: number,
    data: Partial<EventInput>,
    file?: Express.Multer.File
  ) {
    const { ticketTypes, promotions, ...eventData } = data;

    if (file?.path) {
      (eventData as any).imageUrl = file.path;
    }

    return await prisma.event.update({
      where: { id },
      data: eventData,
      include: {
        ticketTypes: true,
      },
    });
  }
}
