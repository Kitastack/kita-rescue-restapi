import { Router } from "express";

export default abstract class Route {
  public router: Router;
  constructor() {
    this.router = Router();
    this.useRoutes();
  }
  abstract useRoutes(): void;
}
