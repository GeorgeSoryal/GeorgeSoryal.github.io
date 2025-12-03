/* eslint-disable max-len */
import {setGlobalOptions} from 'firebase-functions/v2';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {onRequest} from 'firebase-functions/v2/https';
import {defineSecret} from 'firebase-functions/params';
import admin from 'firebase-admin';
import webpush from 'web-push';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// // The public key must match the one in client side
const VAPID_PUBLIC_KEY = 'BCDJUHABAbHBYrobjnlUJNJTrfVoN1u_4MUjNO4ZjVn_3XtpwAD2Rh1FePy71LeVJghNK8aTWFBFSzzBGYUOcds';
const VAPID_PRIVATE_KEY = defineSecret('VAPID_PRIVATE_KEY');


// Global options (applies to all V2 functions)

setGlobalOptions({maxInstances: 10});

admin.initializeApp();
const db = admin.firestore();

export const scheduledDaily = onSchedule({
  secrets: ['VAPID_PRIVATE_KEY'],
  schedule: '45 23 * * *',
  timeZone: 'America/New_York',
  region: 'us-central1'}, async (context: any) => {
  const vapidPrivateKey = VAPID_PRIVATE_KEY.value();
  if (!vapidPrivateKey) {
    console.error('VAPID_PRIVATE_KEY secret not found at runtime. Aborting push job.');
    return;
  }
  webpush.setVapidDetails('https://www.georgewsoryal.com/', VAPID_PUBLIC_KEY, vapidPrivateKey);

  const notificationPayload = JSON.stringify({
    title: 'New Pinellas Fun Fact! ☀️🍊🔔',
    body: 'Time to check your app and see what\'s new.',
    url: '/', // homepage
  });
  console.log('notification payload: ' + notificationPayload);

  // Read all subscriptions from Firestore
  const allSubscriptions = await db.collection('subscriptions').get();
  const promises: any = [];

  // Loop through all active subscriptions
  allSubscriptions.forEach((doc) => {
    const subscription = doc.data() as webpush.PushSubscription;
    console.log('Sending push to:', subscription.endpoint);
    console.log('Subscription data:', subscription);
    console.log('doc id:', doc.id);
    // Send the push notification
    const sendPromise = webpush.sendNotification(subscription, notificationPayload)
        .catch((error) => {
          // SET/CLEANUP: If the push failed permanently (410 Gone)
          if (error.statusCode === 410) {
            console.warn('Subscription is expired. Deleting from Firestore:', doc.id);
            // Delete the document from Firestore
            return doc.ref.delete();
          } else {
            console.error('Push failed for:', doc.id, error);
          }
          return null; // Resolve the promise chain
        });

    promises.push(sendPromise);
  });

  // Safely fetch, increment, and persist the nextFactDate
  let nextDateDoc: any = await db.collection('general').doc('nextDate').get();
  nextDateDoc = nextDateDoc.data();

  if (nextDateDoc?.nextFactDate) {
    const currentDayDate = nextDateDoc.nextFactDate.toDate(); // convert to JS Date
    currentDayDate.setDate(currentDayDate.getDate() + 1);
    await db.collection('general').doc('nextDate').set({
      nextFactDate: admin.firestore.Timestamp.fromDate(currentDayDate),
    }, {merge: true});
  } else {
    console.warn('nextFactDate not found in general/nextDate; skipping increment.');
  }

  const oneDay = 1000 * 60 * 60 * 24; // Milliseconds in a day
  const index = Math.floor((nextDateDoc?.nextFactDate.toDate() - nextDateDoc?.firstDate.toDate())/(oneDay)) - 1;
  // Append the fact of the day to pastFacts
  const factsDoc = (await db.collection('general').doc('facts').get()).data();
  const pastFacts = factsDoc?.pastFacts;
  const allFacts = factsDoc?.facts;

  if (index >= 0 && index < allFacts.length) {
    pastFacts.push(allFacts[index]);
    await db.collection('general').doc('facts').set({
      pastFacts: pastFacts,
    }, {merge: true});
  } else {
    pastFacts.push(allFacts[index % (allFacts.length - 1)]);
    await db.collection('general').doc('facts').set({
      pastFacts: pastFacts,
    }, {merge: true});
  }
  // wait for all push and cleanup operations to finish after changing day so failure
  // here doesn't block next day
  await Promise.all(promises);
});

exports.getNextFactDate = onRequest({cors: '*', invoker: 'public'}, async (_req: any, res: any) => {
  try {
    const doc = await db.collection('general').doc('nextDate').get();
    if (!doc.exists) {
      res.status(404).send('No next date found');
      return;
    }
    const data = doc.data();
    res.status(200).json({nextFactDate: data?.nextFactDate});
  } catch (error) {
    console.error('Error fetching next fact date:', error);
    res.status(500).send('Internal Server Error');
  }
});

exports.getLaunchDay = onRequest({cors: '*', invoker: 'public'}, async (_req: any, res: any) => {
  try {
    const doc = await db.collection('general').doc('nextDate').get();
    if (!doc.exists) {
      res.status(404).send('No launch day found');
      return;
    }
    const data = doc.data();
    res.status(200).json({launchDay: data?.firstDate});
  } catch (error) {
    console.error('Error fetching launch day:', error);
    res.status(500).send('Internal Server Error');
  }
});

exports.getPastFacts = onRequest({cors: '*', invoker: 'public'}, async (_req: any, res: any) => {
  try {
    const doc = await db.collection('general').doc('facts').get();
    if (!doc.exists) {
      res.status(404).send('No next fact found');
      return;
    }
    const data = doc.data();
    res.status(200).json({pastFacts: data?.pastFacts});
  } catch (error) {
    console.error('Error fetching next fact:', error);
    res.status(500).send('Internal Server Error');
  }
});

exports.saveSubscription = onRequest({cors: '*', invoker: 'public'}, async (req, res) => {
  // Check for POST request and JSON content
  if (req.method !== 'POST' || !req.body) {
    res.status(400).send('Bad Request');
    return;
  }

  try {
    const subscription = req.body;
    // user endpoint is the id used to come back to them and send subscriptions, and delete them
    const id = Buffer.from(subscription.endpoint, 'utf8').toString('base64'); // cannot have // but some browsers do, so must encode

    await db.collection('subscriptions').doc(id).set(subscription);

    console.log('Subscription saved:', id);
    res.status(201).json({message: 'Subscription saved successfully'});
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).send('Error saving subscription');
  }
});

exports.deleteSubscription = onRequest({cors: '*', invoker: 'public'}, async (req, res) => {
  if (req.method !== 'POST' || !req.body) {
    res.status(400).send('Bad Request');
    return;
  }

  try {
    const endpoint: string = req.body.endpoint;
    if (!endpoint) {
      res.status(400).send('Missing endpoint in request body');
      return;
    }
    const id = Buffer.from(endpoint, 'utf8').toString('base64');
    await db.collection('subscriptions').doc(id).delete();

    res.status(200).json({message: 'Subscription deleted successfully'});
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).send('Error deleting subscription');
  }
});
