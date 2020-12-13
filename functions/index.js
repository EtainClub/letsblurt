const functions = require('firebase-functions');
let dsteem = require('dsteem');
var es = require('event-stream');
var util = require('util');

const MAINNET_OFFICIAL = [
  'https://api.blurt.blog',
  'https://rpc.blurt.world',
  'https://blurtd.privex.io',
  'https://rpc.blurt.buzz',
];
// const client = new dblurt.Client(MAINNET_OFFICIAL, {
//   timeout: 5000,
//   addressPrefix: 'BLT',
//   chainId: 'cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f',
// });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  response.send('Hello from Firebase!');
});
