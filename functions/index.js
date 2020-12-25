const functions = require('firebase-functions');
const axios = require('axios');

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
