import "module-alias/register";

//@package
require("dotenv").config();
import express, { Application } from "express";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import rateLimit, { MemoryStore } from "express-rate-limit";

//@module
// import Persist from "./utils/Persist";
import logger from "./config/logger";

//@routes
import AuthRoute from "./routes/Auth";
import UsersRoute from "./routes/Users";
// import EventsRoute from "./routes/Events";

//@utils
// import { SocketAuthenticate } from "./utils/Authentication";
import mongodb from "./config/mongodb";
// import UserModel from "./models/Users";
// import ParseQueryAggregate from "./utils/ParseQueryAggregate";
// import EventHandler from "./events/handler";
import { join } from "path";

class Server {
  port: any = process.env.PORT;
  app: Application = express();
  server = createServer(this.app);
  //   persist: Persist;
  //   io: SocketServer;
  constructor() {
    // this.persist = new Persist();
    // this.io = new SocketServer(this.server);
  }

  async plugins(): Promise<void> {
    // @plugins
    await mongodb(this.app);
    this.app.use(helmet({ hidePoweredBy: true, frameguard: true }));
    this.app.use(
      cors({
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
      })
    );
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(function (req?: any, res?: any, next?: any) {
      logger.info(
        "request",
        `${req.url} with status ${req?.statusCode || 200}`
      );
      next();
    });
    this.app.use(
      rateLimit({
        windowMs: 5 * 1000, // 5 seconds
        handler: (request, response, next, options) =>
          response.status(options.statusCode).json({
            message:
              "Terlalu banyak request dari IP ini. Coba beberapa saat lagi.",
            success: false,
          }),
        max: 100,
        standardHeaders: true,
        store: new MemoryStore(),
      })
    );
  }

  async load(): Promise<void> {
    try {
      await this.plugins();
      // @routes
      this.app.use(
        "/ping",
        (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          return res.status(200).json({
            success: true,
            message: "pong!",
          });
        }
      );
      this.app.use("/v1/Auth", AuthRoute.router);
      this.app.use("/v1/Users", UsersRoute.router);
      //   this.app.use("/v1/Events", EventsRoute.router);
      // @handle bad request
      this.app.use((err: any, req: any, res: any, next: any) => {
        if (err.status === 400 && "body" in err) {
          //   logger.error("request", ` ${err}`);
          return res
            .status(400)
            .send({ success: false, message: err?.message });
        }
        next();
      });

      // @handle not found
      this.app.get("*", (req: express.Request, res: express.Response) => {
        res.status(404).json({
          message: "Endpoint tidak ditemukan",
          success: false,
        });
      });
    } catch (error) {
      logger.error("server", `Configuration failed! : ${error}`);
    }
  }

  async initialize(): Promise<void> {
    await this.load();
    this.server.listen(this.port || 8080, () => {
      //   logger.info("server", `Connected to port ${this.port}`);
    });
  }
}

const arg = new Server();
arg.initialize();
