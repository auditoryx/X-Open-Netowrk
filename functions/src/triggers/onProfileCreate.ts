import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const onProfileCreate = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const role = data?.role;

    if (!role) {
      console.log('No role found for user', context.params.uid);
      return null;
    }

    const templatesSnap = await admin
      .firestore()
      .collection('serviceTemplates')
      .doc(role)
      .collection('templates')
      .get();

    if (templatesSnap.empty) {
      console.log(`No templates for role ${role}`);
      return null;
    }

    const batch = admin.firestore().batch();
    templatesSnap.forEach((doc) => {
      const dest = admin
        .firestore()
        .collection('users')
        .doc(context.params.uid)
        .collection('services')
        .doc(doc.id);
      batch.set(dest, doc.data());
    });

    await batch.commit();
    return null;
  });
