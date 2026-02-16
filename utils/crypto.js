const crypto = require('crypto');

const generatePublicToken=()=>{
  return crypto.randomBytes(10).toString('base64url');
}

module.exports={ generatePublicToken};