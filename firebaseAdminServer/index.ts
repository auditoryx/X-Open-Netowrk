import * as firebaseAdmin from "firebase-admin";
import serviceAccount from "./key.json";

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount as firebaseAdmin.ServiceAccount),
  });
}

export default firebaseAdmin;
