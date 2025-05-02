import express, { Application } from "express";
//import cors from 'cors';
import { UserRouter } from "./router/user.router";
import { AuthRouter } from "./router/auth.router";
import { EventRouter } from "./router/event.router";
import { TicketTypeRouter } from "./router/ticketType.router";
import { ProfileRouter } from "./router/profile.router";
import { PromotionRouter } from "./router/promotion.router";
import { TransactionRouter } from "./router/transaction.router";
import { startTransactionStatusJob } from "./cron/jobs/transactionJobs";

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = 3000;
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    //this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use("/api", new UserRouter().router);
    this.app.use("/api", new AuthRouter().router);
    this.app.use("/api", new EventRouter().router);
    this.app.use("/api", new TicketTypeRouter().router);
    this.app.use("/api", new ProfileRouter().router);
    this.app.use("/api", new PromotionRouter().router);
    this.app.use("/api", new TransactionRouter().router);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

startTransactionStatusJob();
const server = new Server();
server.start();
