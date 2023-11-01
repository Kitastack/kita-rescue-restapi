import admin from "./admin";

const db = admin.firestore();
db.settings({ Timestamp: true });

export default db;
