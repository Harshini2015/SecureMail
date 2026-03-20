const axios = require('axios');

const MX_KEY = process.env.MXTOOLBOX_API_KEY;

async function checkDomain(domain) {
  try {
    const res = await axios.get(
      `https://mxtoolbox.com/api/v1/lookup/blacklist/${domain}`,
      { headers: { Authorization: MX_KEY } }
    );
    const data = res.data;
    const blacklistCount = data.Failed?.length || 0;
    return {
      isBlacklisted: blacklistCount > 0,
      blacklistCount,
      mxRecordExists: Array.isArray(data.MxRep) && data.MxRep.length > 0
    };
  } catch (err) {
    console.error('MXToolbox error:', err.message);
    return { isBlacklisted: false, blacklistCount: 0, mxRecordExists: false };
  }
}

module.exports = { checkDomain };
