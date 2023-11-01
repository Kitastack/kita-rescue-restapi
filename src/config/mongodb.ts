require("dotenv").config();
import { Application, Request, Response } from "express";
import mongoose, { ConnectOptions } from "mongoose";
import logger from "./logger";
const morgan = require("mongoose-morgan");

const username = process.env.MONGO_USERNAME;
const pass = process.env.MONGO_PASS;
const dbname = process.env.MONGO_DBNAME;
// const cluster = process.env.MONGO_CLUSTER;
const uri = `mongodb+srv://${username}:${pass}@${dbname}.p32clis.mongodb.net/?retryWrites=true&w=majority`;
// mongodb+srv://admin:<password>@strukku-sandbox.9e3kbfu.mongodb.net/?retryWrites=true&w=majority

export default async (app: Application) => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(uri);

  app.use(
    morgan(
      {
        collection: "log_error",
        connectionString: uri,
      },
      {
        skip: function (req: any, res: any) {
          return (
            res.statusCode <= 400 ||
            res.statusCode === 404 ||
            res.statusCode === 403 ||
            res.statusCode === 401
          );
        },
      },
      "dev"
    )
  );

  logger.info("mongodb", "Successfully connected!");
};
