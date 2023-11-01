import * as e from "express";

export default interface IController {
  aggregate(query: any[]): Promise<[] | {} | void>;
  // create(req: e.Request): Promise<FirebaseFirestore.DocumentData | void>;
  // update(req: e.Request): Promise<FirebaseFirestore.DocumentData | void>;
  // delete(req: e.Request): Promise<FirebaseFirestore.DocumentData | void>;
}
