import mongoose from "mongoose";

const Users = new mongoose.Schema(
  {
    _id: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    picture: { type: String },
    roles: { type: Array, default: [] },
    lat: { type: String },
    lng: { type: String },
    savedEvents: { type: Array },
    isEmailVerified: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    _createdDate: { type: Date, default: new Date() },
    _updatedDate: { type: Date, default: new Date() },
  },
  { collection: "Users" }
);

Users.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("Users", Users);
