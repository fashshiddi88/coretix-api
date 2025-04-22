import { prisma } from "../prisma/client";
import { EventInput } from "../models/interface";

export class EventService {
  public async create(data: EventInput, organizerId: number) {
    const event = await prisma.event.create({
      data: {
        ...data,
        organizerId,
      },
    });

    return event;
  }
}
