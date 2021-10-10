/**
 *  ECDSA in JavaScript: secp256k1-based sign / verify / recoverPubKey 
 *  https://gist.github.com/nakov/1dcbe26988e18f7a4d013b65d8803ffc
 */

let elliptic = require('elliptic');
let sha3 = require('js-sha3');
let ec = new elliptic.ec('secp256k1');


const hash = (s) => {
  return sha3.keccak256(s);
}

const sign = (hashStr = '', privateKey) => {
  return ec.sign(hashStr, privateKey, "hex", { canonical: true });
}

const signObj = (dataObj = {}, privateKey = '') => {

  const dataStr = JSON.stringify(dataObj)
  const hashStr = hash(dataStr)
  const signature = sign(hashStr, privateKey)

  return [str, hashStr, signature]
}

const signString = (datastr, privateKey) => {
  let hashStr = hash(datastr);
  let signature = sign(hashStr, privateKey);

  return signature
}

// https://stackoverflow.com/questions/6182315/how-to-do-base64-encoding-in-node-js
// > console.log(Buffer.from("Hello World").toString('base64'));
// SGVsbG8gV29ybGQ =
// > console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))
// Hello World

const strToBase64 = (data) => {
  return Buffer.from(data).toString('base64')
  // const buff = Buffer.from(`${data}`);
  // return buff.toString('base64');
}

const base64ToStr = (data) => {
  // let data = 'c3RhY2thYnVzZS5jb20=';
  // let buff = new Buffer(data, 'base64');
  // let text = buff.toString('ascii');

  return Buffer.from(data, 'base64').toString('ascii')

}

const verifyTxSign = (txHash, signature) => {

  // let txHash = sha3.keccak256(txString);

  const pubKeyRecovered = ec.recoverPubKey(
    hexToDecimal(txHash),
    signature,
    signature.recoveryParam,
    "hex"
  );
  // console.log("Recovered pubKey:", pubKeyRecovered.encodeCompressed("hex"));

  const validSig = ec.verify(txHash, signature, pubKeyRecovered);

  // console.log("Signature valid?", validSig);
  if (!validSig) {
    return null
  }
  return pubKeyRecovered;
}

const getAddressFromPair = (pair) => {
  const a = pair.getPublic().encode("hex").substr(2)
  return (a).substr(0, 4) //or hash(a) ?
}

const getAddressFromPubKey = (pubKey) => {
  return (pubKey).substr(0, 4)
}


const getPrivate = (pair) => {
  return pair.getPrivate("hex")
}

const getPublic = (pair) => {
  return pair.getPublic().encode("hex").substr(2)
}


const generatePair = () => { return ec.genKeyPair() }

const generatePairFromPrivate = (k) => {
  if (!verifyKeyFormat64HexStr(k)) {
    throw new Error('private key must be 64 characters length hex string')
  }
  return ec.keyFromPrivate(privateKey);
}

const verifyKeyFormat64HexStr = (k) => {

  if (!/^[0-9a-f]{64}$/.test(k)) {
    throw new Error('private key must be 64 characters length hex string')
  }

  return true;
}

const hexToDecimal = (x) => ec.keyFromPrivate(x, "hex").getPrivate().toString(10);


module.exports = {
  getPublic,
  getPrivate,
  getAddressFromPair,
  getAddressFromPubKey,
  signObj,
  signString,
  base64ToStr,
  strToBase64,
  sign,
  hash,
  generatePair,
  generatePairFromPrivate,
  // signTx,
  verifyTxSign
}

const test = () => {
  const tx = {
    src: "123",
    dest: "123",
    amount: 5,
  }
  const sign1 = signObj(tx)
  console.log(sign1)

}

test()