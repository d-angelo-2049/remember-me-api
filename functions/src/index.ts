/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

admin.initializeApp();
export const getBooks = onRequest(async (request, response) => {
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