// const admin = require("firebase-admin");
import serviceAccount from "../serviceAccount.json";
import admin, { ServiceAccount } from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  storageBucket: "sandbox.appspot.com",
});

export default admin;
