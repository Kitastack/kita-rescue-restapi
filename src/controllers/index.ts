import * as e from "express";
import IController from "./interface/index";
import ParseQueryAggregate from "../utils/ParseQuery";
import logger from "../config/logger";
import { Model } from "mongoose";

export default class Controller implements IController {
  model: Model<any>;
  /**
   * @param collectionName => name of a collection as string
   */
  constructor(model: Model<any>) {
    this.model = model;
  }
  async aggregate(
    query: any[],
    limit?: number,
    page: number = 1
  ): Promise<[] | {} | void> {
    let payload: any, result;
    // const count = await this.model.aggregate(query).count("_id");
    try {
      const count =
        (
          await this.model.aggregate([
            ...query,
            { $group: { _id: null, n: { $sum: 1 } } },
          ])
        )?.[0]?.n || 0;

      query.push({ $skip: Number((page - 1) * (Number(limit) || 0)) });
      if (limit) {
        query.push({ $limit: Number(limit) });
      }

      result = await this.model
        .aggregate(query)
        .option({
          collation: {
            locale: "en",
          },
        })
        .exec();
      payload = {
        success: true,
        result,
        length: count && limit ? Math.ceil(count / limit) : 1,
        count,
      };
      //  Count
    } catch (error: any) {
      payload.result = null;
      payload.success = false;
      payload.message = error?.message;
      logger.error("controller", error?.message);
    } finally {
      return payload;
    }
  }
}
