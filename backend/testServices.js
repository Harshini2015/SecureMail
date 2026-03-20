// backend/testServices.js
require('dotenv').config();
const { checkEmailAuthentication } = require('./services/emailAuthService');
const { checkDomain } = require('./services/mxToolboxService');

async function test() {
  console.log('--- gmail.com ---');
  console.log(await checkEmailAuthentication('gmail.com'));
  console.log(await checkDomain('gmail.com'));
  console.log('--- fakephishingdomain123.xyz ---');
  console.log(await checkEmailAuthentication('fakephishingdomain123.xyz'));
  console.log(await checkDomain('fakephishingdomain123.xyz'));
}
test();
