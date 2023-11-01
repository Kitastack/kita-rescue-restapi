import Route from ".";
import * as e from "express";
import db from "../config/db";
import Auth from "../controllers/Auth";
import logger from "../config/logger";
import { LocalAuthenticate } from "../utils/Authenticated";

export default new (class AuthRoute extends Route {
  useRoutes() {
    // this.router.get("/", (req: e.Request, res: e.Response) => {
    //   db.collection("pesanan")
    //     .get()
    //     .then((data) => {
    //       if (data) {
    //         return res.status(200).json("ok");
    //       }
    //       res.status(400).json("OK");
    //       return;
    //     });
    // });
    try {
      this.router.post("/login", Auth.login);
      this.router.post("/logout", Auth.logout);
      this.router.get("/key", Auth.key);
      this.router.post(
        "/sendResetPasswordByEmail",
        Auth.sendResetPasswordByEmail
      );
      this.router.patch("/resetPasswordByEmail", Auth.doResetPasswordByEmail);
      this.router.post(
        "/resetPassword",
        LocalAuthenticate(),
        Auth.resetPassword
      );
    } catch (error: any) {
      // ErrorHandle(error);
      logger.error("auth-routes", error?.message || error);
    }
    // this.router.post("/register", Auth.register);
  }
})();
