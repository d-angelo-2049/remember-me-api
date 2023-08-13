/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
admin.initializeApp();

const validatePostFoodParamsSchema = (params: any) => {
  const hasName = "name" in params;
  const hasExpiration = "expiration" in params;
  const hasLocation = "location" in params;
  const hasImageString = "imageString" in params;
  const hasStatus = "status" in params;

  logger.info("hasName:" + hasName);
  logger.info("hasExpiration:" + hasExpiration);
  logger.info("hasLocation:" + hasLocation);
  logger.info("hasImageString:" + hasImageString);
  logger.info("hasStatus:" + hasStatus);

  return hasName && hasExpiration && hasLocation && hasImageString;
};

export const postFood = functions.https.onCall(
  async (
    data: {
      name: any;
      expiration: any;
      location: any;
      imageString: any;
      status: any;
    },
    context: any
  ) => {
    if (!validatePostFoodParamsSchema(data)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "invalid paramteres"
      );
    }

    const {name, expiration, location, imageString, status} = data;
    const db = admin.firestore();
    return await db
      .collection("foods")
      .add({
        name: name,
        expiration: expiration,
        location: location,
        imageString: imageString,
        status: status,
      })
      .then((documentReference: { id: any }) => {
        logger.info(`Added document with name: ${documentReference.id}`);
        return {documentId: documentReference.id};
      });
  }
);

export const readFood = functions.https.onCall(
  async (data: { documentId: any }, context: any) => {
    const hasDocumentId = "documentId" in data;

    if (!hasDocumentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "invalid paramteres"
      );
    }

    const db = admin.firestore();
    return await db
      .collection("foods")
      .doc(data.documentId)
      .get()
      .then((documentSnapshot: { exists: any; data: () => any }) => {
        if (!documentSnapshot.exists) {
          logger.info("No such document!");
          throw new functions.https.HttpsError(
            "not-found",
            "resource not found"
          );
        }
        logger.info(`read document data: ${documentSnapshot.data()}`);
        return {documentId: data.documentId, data: documentSnapshot.data()};
      });
  }
);

export const updateFood = functions.https.onCall(
  async (data: { documentId: any; status: any }, context: any) => {
    const hasDocumentId = "documentId" in data;

    if (!hasDocumentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "invalid paramteres"
      );
    }
    const db = admin.firestore();

    await db
      .collection("foods")
      .doc(data.documentId)
      .get()
      .then((documentSnapshot: { exists: any }) => {
        if (!documentSnapshot.exists) {
          logger.info("No such document!");
          throw new functions.https.HttpsError(
            "not-found",
            "resource not found"
          );
        }
      });

    try {
      return await db
        .collection("foods")
        .doc(data.documentId)
        .update({
          status: data.status,
        })
        .then((writeResult: { writeTime: { toDate: () => any } }) => {
          logger.info(
            `updated document, write time: ${writeResult.writeTime.toDate()}`
          );
          return "success";
        });
    } catch (e) {
      throw new functions.https.HttpsError(
        "unknown",
        "failed to update data",
        e
      );
    }
  }
);

export const dangerList = functions.https.onCall(
  async (data: any, context: any) => {
    const db = admin.firestore();

    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000; // JSTオフセット（UTC+9）
    const currentJST = new Date(now.getTime() + jstOffset);

    // 過去5日間と未来1週間の範囲を計算
    const fiveDaysAgo = new Date(currentJST);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const oneWeekAhead = new Date(currentJST);
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);

    return await db
      .collection("foods")
      .get()
      .then((querySnapshot: { docs: any[] }) => {
        // 　過去5日間かつ未来一週間で期限を迎える食品を返却
        return querySnapshot.docs
        .filter((doc) => {
          const expirationDate = new Date(doc.data().expiration.replace(/(.*)\((.*)\)/, '$1'));
          return expirationDate >= fiveDaysAgo && expirationDate <= oneWeekAhead;
        })
        .map((doc) => {
          return {documentId: doc.id, data: doc.data()};
        }).sort((a, b) => {
          // ascending order
          const dateA = new Date(
            a.data.expiration.replace(/(.*)\((.*)\)/, "$1"));
          const dateB = new Date(
            b.data.expiration.replace(/(.*)\((.*)\)/, "$1"));
          return dateA.getTime() - dateB.getTime();
        });
      });
  }
);
