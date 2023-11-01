import mongoose from "mongoose";

const Auth = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    _createdDate: { type: Date, defaut: new Date() },
    _updatedDate: { type: Date, default: new Date() },
  },
  { collection: "Auth" }
);

Auth.set("toJSON", {
  transform: function (doc, ret, options) {
    return ret;
  },
});

export default mongoose.model("Auth", Auth);
