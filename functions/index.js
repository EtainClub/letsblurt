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
const client = new dsteem.Client(MAINNET_OFFICIAL, {
  timeout: 5000,
  addressPrefix: 'BLT',
  chainId: 'cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f',
});

const stream = client.blockchain.getOperationsStream({
  mode: dsteem.BlockchainMode.Latest,
});

// const stream = client.blockchain.getOperationsStream({
//   mode: dsteem.BlockchainMode.Latest,
// });

exports.blockData = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    // const block = await client.blockchain.getCurrentBlock();
    console.log('block', block);
  });
