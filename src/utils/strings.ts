function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

export const substr_utf8_bytes = (str, startInBytes, lengthInBytes) => {
  /* this function scans a multibyte string and returns a substring. 
    * arguments are start position and length, both defined in bytes.
    * 
    * this is tricky, because javascript only allows character level 
    * and not byte level access on strings. Also, all strings are stored
    * in utf-16 internally - so we need to convert characters to utf-8
    * to detect their length in utf-8 encoding.
    *
    * the startInBytes and lengthInBytes parameters are based on byte 
    * positions in a utf-8 encoded string.
    * in utf-8, for example: 
    *       "a" is 1 byte, 
            "ü" is 2 byte, 
       and  "你" is 3 byte.
    *
    * NOTE:
    * according to ECMAScript 262 all strings are stored as a sequence
    * of 16-bit characters. so we need a encode_utf8() function to safely
    * detect the length our character would have in a utf8 representation.
    * 
    * http://www.ecma-international.org/publications/files/ecma-st/ECMA-262.pdf
    * see "4.3.16 String Value":
    * > Although each value usually represents a single 16-bit unit of 
    * > UTF-16 text, the language does not place any restrictions or 
    * > requirements on the values except that they be 16-bit unsigned 
    * > integers.
    */

  var resultStr = '';
  var startInChars = 0;

  // scan string forward to find index of first character
  // (convert start position in byte to start position in characters)

  for (let bytePos = 0; bytePos < startInBytes; startInChars++) {
    // get numeric code of character (is >128 for multibyte character)
    // and increase "bytePos" for each byte of the character sequence

    let ch = str.charCodeAt(startInChars);
    bytePos += ch < 128 ? 1 : encode_utf8(str[startInChars]).length;
  }

  // now that we have the position of the starting character,
  // we can built the resulting substring

  // as we don't know the end position in chars yet, we start with a mix of
  // chars and bytes. we decrease "end" by the byte count of each selected
  // character to end up in the right position
  let end = startInChars + lengthInBytes - 1;

  for (let n = startInChars; startInChars <= end; n++) {
    // get numeric code of character (is >128 for multibyte character)
    // and decrease "end" for each byte of the character sequence
    let ch = str.charCodeAt(n);
    end -= ch < 128 ? 1 : encode_utf8(str[n]).length;

    resultStr += str[n];
  }

  return resultStr;
};
