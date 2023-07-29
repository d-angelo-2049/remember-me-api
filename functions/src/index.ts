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

export const helloWorld = functions.https.onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

admin.initializeApp();
export const getBooks = functions.https.onRequest(async (request, response) => {
  try {
    // firestoreのインスタンスを取得
    const db = admin.firestore();

    //インスタンスからコレクションを取得
    const ref = await db.collection("books").get();
    response.send(ref.docs);
  } catch (e) {
    console.error(e);
    response.status(500).send(e);
  }
});

const validatePostFoodParamsSchema = (params: any) => {
  const hasName = "name" in params;
  const hasExpiration = "expiration" in params;
  const hasLocation = "location" in params;
  const hasImageString = "imageString" in params;

  return hasName && hasExpiration && hasLocation && hasImageString;
};

export const postFood = functions.https.onCall(async (data, context) => {
  if (validatePostFoodParamsSchema(data)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "invalid paramteres"
    );
  }

  const { name, expiration, location, imageString } = data;

  try {
    const db = admin.firestore();
    await db
      .collection("foods")
      .add({
        name: name,
        expiration: expiration,
        location: location,
        imageString: imageString,
      })
      .then((documentReference) => {
        logger.info(`Added document with name: ${documentReference.id}`);
        return {
          documentId: documentReference.id,
          name: name,
          expiration: expiration,
          location: location,
          imageString: imageString,
        };
      });
  } catch (e) {
    throw new functions.https.HttpsError(
      "internal",
      "internal server error",
      e
    );
  }
});
