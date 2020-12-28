const functions = require('firebase-functions');
const axios = require('axios');
const dblurt = require('./dblurt');

const MAINNET_OFFICIAL = [
  'https://api.blurt.blog',
  'https://rpc.blurt.world',
  'https://blurtd.privex.io',
  'https://rpc.blurt.buzz',
];
const client = new dblurt.Client(MAINNET_OFFICIAL, {
  timeout: 5000,
  addressPrefix: 'BLT',
  chainId: 'cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f',
});

// proxy for google custom search
exports.searchRequest = functions.https.onCall(async (data, res) => {
  console.log('input data', data);
  const {query, startAt = 1, num = 10, sort = ''} = data;

  const key = functions.config().search.key;
  const cx = functions.config().search.cx;
  const search = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${query}&num=${num}&start=${startAt}&sort=${sort}`;

  console.log('key', key);
  console.log('cx', cx);
  console.log('search', search);

  //    const response = await axios.get(search);
  let result = null;
  await axios
    .get(search)
    .then((response) => {
      result = response.data;
      console.log('response result', result);
    })
    .catch((error) => console.log('failed to search', error));

  return result;
});

// proxy for google translation v3
exports.translationRequest = functions.https.onCall(async (data, context) => {
  console.log('input data', data);
  const {text, targetLang, format} = data;

  const options = {
    target: targetLang,
    q: text,
    format,
  };

  const key = functions.config().translation.key;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
  console.log('url', url);

  let result = null;
  await axios
    .post(url, options)
    .then((response) => {
      result = response.data;
      console.log('response result', result);
    })
    .catch((error) => console.log('failed to translate', error));

  return result;
});

// proxy for creating blurt account
exports.createAccountRequest = functions.https.onCall(async (data, context) => {
  const {username, password, creationFee} = data;

  // get creator account
  const creator = functions.config().creator.account;
  const creatorWif = functions.config().creator.wif;

  // private active key of creator account
  const creatorKey = dblurt.PrivateKey.fromString(creatorWif);
  // create keys
  const ownerKey = dblurt.PrivateKey.fromLogin(username, password, 'owner');
  const activeKey = dblurt.PrivateKey.fromLogin(username, password, 'active');
  const postingKey = dblurt.PrivateKey.fromLogin(username, password, 'posting');
  const memoKey = dblurt.PrivateKey.fromLogin(
    username,
    password,
    'memo',
  ).createPublic(client.addressPrefix);

  const ownerAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[ownerKey.createPublic(client.addressPrefix), 1]],
  };
  const activeAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[activeKey.createPublic(client.addressPrefix), 1]],
  };
  const postingAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[postingKey.createPublic(client.addressPrefix), 1]],
  };

  //// send creation operation
  // operations
  let operations = [];
  //create operation to transmit
  const create_op = [
    'account_create',
    {
      fee: creationFee,
      creator: creator,
      new_account_name: username,
      owner: ownerAuth,
      active: activeAuth,
      posting: postingAuth,
      memo_key: memoKey,
      json_metadata: '',
      extensions: [],
    },
  ];
  console.log(create_op);
  // push the creation operation
  operations.push(create_op);
  // broadcast operation to blockchain
  // let result = null;
  // client.broadcast
  //   .sendOperations(operations, creatorKey)
  //   .then((response) => {
  //     console.log('creation result', result);
  //     result = response;
  //   })
  //   .catch((error) => console.log('account creation failed', error));

  try {
    const result = await client.broadcast.sendOperations(
      operations,
      creatorKey,
    );
    console.log('create account, result', result);
    // TODO if successful, transfer 10 blurt to the account
    return result;
  } catch (error) {
    console.log('failed to create account', error);
    return null;
  }
});
