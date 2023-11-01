// // @ts-nocheck

import * as e from "express";
import admin from "../config/admin";
import jwt from "jsonwebtoken";
import AuthModel from "../models/Auth";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const LocalAuthenticate =
  (roles?: Array<string>) =>
  (req: e.Request, res: e.Response, next: e.NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({
        message: "Tidak memiliki hak akses",
        status: 401,
        success: false,
      });
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(
      token as string,
      process.env.ACCESS_SECRET as string,
      async (err: any, user: any) => {
        if (err) {
          return res.status(403).send({
            success: false,
            message: "Harap login dahulu",
          });
        }
        if (roles && Array.isArray(roles)) {
          if (roles.length > 0 && !user?.roles) {
            return res.status(401).send({
              message: "Tidak memiliki hak akses",
              status: 401,
              success: false,
            });
          }

          if (
            roles.length > 0 &&
            !user?.roles.some((item: any) => roles?.includes(item))
          ) {
            return res.status(401).send({
              message: "Tidak memiliki hak akses",
              status: 401,
              success: false,
            });
          }
        }
        if (await AuthModel.exists({ _id: user?._id, userId: user?.userId })) {
          // @ts-ignore-start
          req.user = user;
          return next();
        }
        res.status(401).send({
          success: false,
          message: "Tidak memiliki akses",
        });
      }
    );
  };

//* Socket Authenticate Token

export const SocketAuthenticate = async (
  { ...data }: any,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  callBack: Function
): Promise<any> => {
  if (!data.refreshToken) {
    return socket.emit("status", {
      message: "Tidak memiliki hak akses",
      success: false,
    });
  }

  jwt.verify(
    data.refreshToken as string,
    process.env.REFRESH_SECRET as string,
    async (err: any, user: any) => {
      if (err) {
        return socket.emit("status", {
          message: "Harap Login dahulu",
          success: false,
        });
      }
      if (await AuthModel.exists({ _id: user?._id, userId: user?.userId })) {
        // @ts-ignore-start
        req.user = user;
        return callBack({
          message: "Berhasil login",
          result: {
            ...user,
            userId: data.userId,
          },
          success: true,
        });
      }
      return socket.emit("status", {
        message: "Tidak memiliki  akses",
        success: false,
      });
    }
  );
};
