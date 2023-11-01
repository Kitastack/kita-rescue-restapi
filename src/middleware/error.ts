import IError from "./interface/error";
import * as e from "express";
import logger from "../config/logger";

const ErrorHandle = (
  err: Error,
  req: e.Request,
  res: e.Response,
  next: e.NextFunction
) => {
  const error: IError = err as IError;
  if (res) {
    res.status(error.status || 500).json({
      message: error.message,
      // status: error.status,
      success: false,
    });
  }
  logger.error(String(error.status), error.message);
};
export default ErrorHandle;
