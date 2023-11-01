import Controller from ".";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import * as uuid from "uuid";

import UsersModel from "../models/Users";
import UserValidator from "../validator/User";

import jwt from "jsonwebtoken";
import db from "../config/db";
import ParseQuery from "../utils/ParseQuery";
import ErrorHandle from "../middleware/error";
import Auth from "./Auth";

export default class User {
  public static readonly collection: string = "Users";

  public static async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const controller: Controller = new Controller(UsersModel);
      const query = ParseQuery(req.query.payload as any);
      const result = await controller.aggregate(
        [
          ...query.aggregate,
          {
            $project: {
              password: 0,
            },
          }, // exclude removed event
        ],
        req.query?.limit as any,
        req.query?.at as any
      );

      res.status(200).json(result);
    } catch (error: any) {
      ErrorHandle(error, req, res, next);
    }
  }

  public static async getSavedEvents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const controller: Controller = new Controller(UsersModel);
      const query = ParseQuery(req.query.payload as any);
      const result = await controller.aggregate(
        [
          ...query.aggregate,
          {
            $project: {
              email: 0,
              isEmailVerified: 0,
              password: 0,
              roles: 0,
              username: 0,
            },
          }, // exclude removed event
        ],
        req.query?.limit as any,
        req.query?.at as any
      );

      res.status(200).json(result);
    } catch (error: any) {
      ErrorHandle(error, req, res, next);
    }
  }

  public static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const controller: Controller = new Controller(UsersModel);
      const validateBody = await UserValidator(req);

      // @validate
      // user.username = req.body.username;
      // user.email = req.body.email;
      // user.password = req.body.password;

      if (Object.values(validateBody).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Periksa kembali formulir data Anda",
          detail: validateBody,
        });
      }

      const role = req.body.role;

      // Check if user exist
      const isUserAlreadyRegistered = await controller.model.findOne({
        email: new RegExp(`^${req.body.email}$`, "gi"),
      });

      if (isUserAlreadyRegistered) {
        return res.status(400).json({
          success: false,
          message: "Akun sudah terdaftar",
        });
      }

      const _id = req.body?._id; // custom id

      const hashedPassword = crypto
        .createHash("sha256", process.env.HASH_SECRET as any)
        .update(req.body.password)
        .digest("hex");

      const newUser = {
        username: req.body.username,
        picture: req.body.picture,
        email: String(req.body.email).toLowerCase().trim(),
        password: hashedPassword,
        $addToSet: { roles: role },
        $setOnInsert: {
          _id: _id || uuid.v4(),
          _createdDate: new Date(),
        },
        _updatedDate: new Date(),
      };

      const createdUser = await controller.model.findOneAndUpdate(
        { email: new RegExp(`^${newUser.email}$`, "gi") },
        newUser,
        { upsert: true, new: true }
      );

      const key = await Auth.generateRefreshToken({
        ...createdUser,
        userId: createdUser._id,
      });

      res.status(201).json({
        message: "Berhasil daftar akun",
        result: {
          _id: createdUser._id,
          username: createdUser.username,
          email: createdUser.email,
          roles: createdUser.roles,
          key,
        },
        success: true,
      });
    } catch (error: any) {
      console.log(error);
      ErrorHandle(error, req, res, next);
    }
  }

  public static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const controller: Controller = new Controller(UsersModel);
      const body = Object.assign({}, req.body);

      delete body.password;
      delete body.email; // prevent

      const _id = req.params._id;
      if (!_id) {
        return res.status(400).json({
          success: false,
          message: "Id akun yang akan diperbarui tidak ada",
        });
      }
      const user = await controller.model.findOneAndUpdate(
        { _id },
        {
          ...body,
          _updatedDate: new Date(),
        },
        {
          new: true,
        }
      );

      delete user.password;
      res.json({
        success: true,
        result: user,
        message: "Berhasil update akun",
      });
    } catch (error: any) {
      ErrorHandle(error as any, req, res, next);
    }
  }

  public static async savedEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const controller: Controller = new Controller(UsersModel);
      const eventIds = req.body.events; // array

      const _id = req.params._id;
      if (!_id) {
        return res.status(400).json({
          success: false,
          message: "Id user tidak ada",
        });
      }
      if (!Array.isArray(eventIds)) {
        return res.status(400).json({
          success: false,
          message: "payload events harus array",
        });
      }
      const user = await controller.model.findOneAndUpdate(
        { _id },
        {
          savedEvents: eventIds,
          _updatedDate: new Date(),
        },
        {
          new: true,
        }
      );

      if (user) {
        delete user.password;
        return res.json({
          success: true,
          result: user,
          message: "Berhasil menambah event user",
        });
      }
      return res.status(400).json({
        success: false,
        message: "user tidak ditemukan",
      });
    } catch (error: any) {
      ErrorHandle(error as any, req, res, next);
    }
  }
}
