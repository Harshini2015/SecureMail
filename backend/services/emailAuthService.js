const dns = require('dns').promises;

async function checkEmailAuthentication(domain) {
  const results = { hasSPF: false, hasDMARC: false, hasDKIM: false };

  try {
    const spfRecords = await dns.resolveTxt(domain);
    results.hasSPF = spfRecords.flat().some(r => r.startsWith('v=spf1'));
  } catch (_) {}

  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    results.hasDMARC = dmarcRecords.flat().some(r => r.startsWith('v=DMARC1'));
  } catch (_) {}

  try {
    const dkimRecords = await dns.resolveTxt(`default._domainkey.${domain}`);
    results.hasDKIM = dkimRecords.length > 0;
  } catch (_) {}

  return results;
}

module.exports = { checkEmailAuthentication };
