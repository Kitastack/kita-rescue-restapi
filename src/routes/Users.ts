import Route from ".";
import * as e from "express";
import User from "../controllers/Users";
import { LocalAuthenticate } from "../utils/Authenticated";
import ErrorHandle from "../middleware/error";
import logger from "../config/logger";
import { nodeMailer } from "../utils/Mailer";

export default new (class UserRoute extends Route {
  useRoutes() {
    try {
      this.router.post("/create", User.create);
      this.router.get("/getSavedEvents", User.getSavedEvents);
      this.router.get("/get", LocalAuthenticate(), User.get);

      this.router.patch("/update/:_id", LocalAuthenticate(), User.update);
      this.router.patch(
        "/saveEvent/:_id",
        LocalAuthenticate(),
        User.savedEvent
      );
      // this.router.post("/email", async (req, res, next) => {
      //   const email = req.body.email;
      //   let result;
      //   if (email) {
      //     result = await nodeMailer(
      //       email,
      //       "Kode nuklir untuk Mr.Rezky Sulihin : 253667"
      //     );
      //   }
      //   if (result) {
      //     return res.json({
      //       success: true,
      //       result,
      //     });
      //   } else {
      //     return res.sendStatus(424).json({
      //       success: false,
      //       message: "Gagal mengirim email",
      //     });
      //   }
      // });
    } catch (error: any) {
      // ErrorHandle(error);
      logger.error("user-routes", error?.message || error);
    }
    // this.router.post("/register", User.register);
  }
})();
