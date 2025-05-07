import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware";

export class DashboardRouter {
  public router: Router;
  private dashboardController: DashboardController;

  constructor() {
    this.router = Router();
    this.dashboardController = new DashboardController();
    this.routes();
  }

  private routes(): void {
    this.router.get(
      "/dashboard/statistics",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      this.dashboardController.getBasicStatistics.bind(this.dashboardController)
    );

    this.router.patch(
      "/dashboard/transactions/:id/accept",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      this.dashboardController.acceptTransaction.bind(this.dashboardController)
    );

    this.router.patch(
      "/dashboard/transactions/:id/reject",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      this.dashboardController.rejectTransaction.bind(this.dashboardController)
    );

    this.router.get(
      "/dashboard/transactions-list/",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      this.dashboardController.getAllTransaction.bind(this.dashboardController)
    );

    this.router.get(
      "/dashboard/events/:eventId/attendees",
      AuthenticationMiddleware.verifyToken,
      AuthorizationMiddleware.allowRoles("ORGANIZER"),
      this.dashboardController.getAttendees.bind(this.dashboardController)
    );
  }
}
