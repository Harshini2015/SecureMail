const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize, User, Email, ThreatLog } = require('../models/index');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connected ✅');

    // ── Wipe existing data ──
    await ThreatLog.destroy({ where: {} });
    await Email.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('Cleared old data ✅');

    // ── Create demo user ──
    const user = await User.create({
      email: 'demo@securemail.com',
      passwordHash: 'Demo@1234'
    });
    console.log('Demo user created ✅');

    const uid = user.id;

    // ── 6 PRIMARY ──
    await Email.create({ userId:uid, sender:'boss@company.com', senderDomain:'company.com', subject:'Team meeting tomorrow at 10am', body:'Hi, just a reminder that we have a team sync tomorrow at 10am in the main conference room. Please come prepared with your weekly updates.', category:'Primary', riskScore:2, isBlocked:false, threatReasons:[], mlConfidence:0.02, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-1*60*60*1000) });
    await Email.create({ userId:uid, sender:'noreply@github.com', senderDomain:'github.com', subject:'Your pull request was merged', body:'Your pull request feat: add authentication has been successfully merged into main. Great work!', category:'Primary', riskScore:1, isBlocked:false, threatReasons:[], mlConfidence:0.01, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-2*60*60*1000) });
    await Email.create({ userId:uid, sender:'friend@gmail.com', senderDomain:'gmail.com', subject:'Are you free this weekend?', body:'Hey! A few of us are planning to catch up this Saturday evening. Let me know if you can make it.', category:'Primary', riskScore:0, isBlocked:false, threatReasons:[], mlConfidence:0.0, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-3*60*60*1000) });
    await Email.create({ userId:uid, sender:'admin@university.edu', senderDomain:'university.edu', subject:'Exam schedule published for December', body:'The December examination timetable has been published on the student portal. Please log in to view your personalized schedule.', category:'Primary', riskScore:3, isBlocked:false, threatReasons:[], mlConfidence:0.03, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-5*60*60*1000) });
    await Email.create({ userId:uid, sender:'support@notion.so', senderDomain:'notion.so', subject:'Your workspace has been updated', body:'We have rolled out new features to your Notion workspace including improved database views and better mobile performance.', category:'Primary', riskScore:2, isBlocked:false, threatReasons:[], mlConfidence:0.02, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-8*60*60*1000) });
    await Email.create({ userId:uid, sender:'hr@techcorp.com', senderDomain:'techcorp.com', subject:'Welcome aboard — Onboarding documents', body:'Welcome to TechCorp! Please find your onboarding documents and access credentials for internal tools. Your first day orientation is Monday at 9am.', category:'Primary', riskScore:4, isBlocked:false, threatReasons:[], mlConfidence:0.04, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-10*60*60*1000) });
    console.log('Primary emails seeded ✅ (6)');

    // ── 3 JOBS ──
    await Email.create({ userId:uid, sender:'recruiter@infosys.com', senderDomain:'infosys.com', subject:'Exciting opportunity — Full Stack Developer at Infosys', body:'Dear candidate, we came across your profile and believe you would be a great fit for our Full Stack Developer role. Please reply with your updated resume.', category:'Jobs', riskScore:5, isBlocked:false, threatReasons:[], mlConfidence:0.05, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-12*60*60*1000) });
    await Email.create({ userId:uid, sender:'noreply@linkedin.com', senderDomain:'linkedin.com', subject:'5 new jobs matching your profile', body:'Based on your skills, here are 5 job openings: Senior React Developer at Google, Backend Engineer at Microsoft, and more. View all on LinkedIn.', category:'Jobs', riskScore:3, isBlocked:false, threatReasons:[], mlConfidence:0.03, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-14*60*60*1000) });
    await Email.create({ userId:uid, sender:'hiring@wipro.com', senderDomain:'wipro.com', subject:'Interview invitation — Software Engineer role', body:'Congratulations! You have been shortlisted for the Software Engineer position at Wipro. Please confirm your availability for a technical interview next week.', category:'Jobs', riskScore:4, isBlocked:false, threatReasons:[], mlConfidence:0.04, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-18*60*60*1000) });
    console.log('Jobs emails seeded ✅ (3)');

    // ── 3 PERSONAL ──
    await Email.create({ userId:uid, sender:'mom@gmail.com', senderDomain:'gmail.com', subject:'Call me when you are free', body:'Hi dear, just wanted to check in. Your father and I were thinking about you. Please call us when you get a chance. We miss you.', category:'Personal', riskScore:0, isBlocked:false, threatReasons:[], mlConfidence:0.0, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-20*60*60*1000) });
    await Email.create({ userId:uid, sender:'college.buddy@outlook.com', senderDomain:'outlook.com', subject:'Notes from today lecture', body:'Hey! Sharing my notes from today Data Structures lecture. We covered AVL trees and Red-Black trees. The assignment is due Friday.', category:'Personal', riskScore:1, isBlocked:false, threatReasons:[], mlConfidence:0.01, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-22*60*60*1000) });
    await Email.create({ userId:uid, sender:'roommate@yahoo.com', senderDomain:'yahoo.com', subject:'Rent due this Friday', body:'Just a heads up that rent is due this Friday. Can you transfer your portion to the landlord account by Thursday evening?', category:'Personal', riskScore:2, isBlocked:false, threatReasons:[], mlConfidence:0.02, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:true, receivedAt:new Date(Date.now()-26*60*60*1000) });
    console.log('Personal emails seeded ✅ (3)');

    // ── 2 PROMOTIONS ──
    await Email.create({ userId:uid, sender:'deals@flipkart.com', senderDomain:'flipkart.com', subject:'Big Billion Days — Up to 80% off starts tonight!', body:'The biggest sale of the year is here! Get up to 80% off on electronics, fashion, and more. Sale starts at midnight.', category:'Promotions', riskScore:12, isBlocked:false, threatReasons:[], mlConfidence:0.12, vtMaliciousCount:0, spfPass:true, dkimPass:true, dmarcPass:false, receivedAt:new Date(Date.now()-28*60*60*1000) });
    await Email.create({ userId:uid, sender:'newsletter@swiggy.com', senderDomain:'swiggy.com', subject:'50% off your next 3 orders — Today only', body:'Hungry? Use code SWIGGY50 to get 50% off on your next 3 orders. Valid today only. Minimum order Rs.199.', category:'Promotions', riskScore:10, isBlocked:false, threatReasons:[], mlConfidence:0.10, vtMaliciousCount:0, spfPass:true, dkimPass:false, dmarcPass:false, receivedAt:new Date(Date.now()-30*60*60*1000) });
    console.log('Promotions emails seeded ✅ (2)');

    // ── 2 SPAM ──
    await Email.create({ userId:uid, sender:'noreply@lucky-draw-winners.com', senderDomain:'lucky-draw-winners.com', subject:'You have been selected for a lucky draw!', body:'Congratulations! Your email has been randomly selected. To claim your entry, forward this email to 10 friends and reply with your full name and phone number.', category:'Spam', riskScore:55, isBlocked:false, threatReasons:['Suspicious domain','Social engineering language'], mlConfidence:0.55, vtMaliciousCount:1, spfPass:false, dkimPass:false, dmarcPass:false, receivedAt:new Date(Date.now()-32*60*60*1000) });
    await Email.create({ userId:uid, sender:'offers@mega-discount-store99.net', senderDomain:'mega-discount-store99.net', subject:'FREE iPhone 15 Pro — Claim before midnight!', body:'You are our 1000000th visitor! You have won a FREE iPhone 15 Pro. This offer expires at midnight. Click the link to claim your prize immediately.', category:'Spam', riskScore:62, isBlocked:false, threatReasons:['Too-good-to-be-true offer','Urgency tactics','Suspicious domain'], mlConfidence:0.62, vtMaliciousCount:2, spfPass:false, dkimPass:false, dmarcPass:false, receivedAt:new Date(Date.now()-35*60*60*1000) });
    console.log('Spam emails seeded ✅ (2)');

    // ── 4 PHISHING ──
    const p1 = await Email.create({ userId:uid, sender:'security-alert@sbi-bank-secure.com', senderDomain:'sbi-bank-secure.com', subject:'URGENT: Your SBI account has been suspended', body:'Dear Customer, we detected suspicious activity on your SBI account. Your account has been temporarily suspended. Verify your identity within 24 hours or your account will be permanently closed.', category:'Phishing', riskScore:95, isBlocked:true, threatReasons:['Domain impersonates SBI bank','Urgency and fear tactics','Suspicious external link','SPF DKIM DMARC all failed','ML model high phishing probability'], mlConfidence:0.95, vtMaliciousCount:8, spfPass:false, dkimPass:false, dmarcPass:false, receivedAt:new Date(Date.now()-38*60*60*1000) });
    const p2 = await Email.create({ userId:uid, sender:'delivery-update@amazon-delivery-in.com', senderDomain:'amazon-delivery-in.com', subject:'Your Amazon package could not be delivered', body:'We attempted to deliver your Amazon package but were unable to complete delivery. Please verify your address and pay a small redelivery fee of Rs.25 to reschedule.', category:'Phishing', riskScore:88, isBlocked:true, threatReasons:['Domain impersonates Amazon','Fake delivery notification','Requesting payment via suspicious link','DMARC failed','ML model phishing detected'], mlConfidence:0.88, vtMaliciousCount:6, spfPass:false, dkimPass:false, dmarcPass:false, receivedAt:new Date(Date.now()-40*60*60*1000) });
    const p3 = await Email.create({ userId:uid, sender:'winner-notification@prize-claim-center.org', senderDomain:'prize-claim-center.org', subject:'You have won Rs.10,00,000 — Claim your prize now', body:'Congratulations! You have been selected as the winner of our international lottery. Your prize is Rs.10,00,000. Send your bank account number and a processing fee of Rs.500 within 48 hours.', category:'Phishing', riskScore:92, isBlocked:true, threatReasons:['Classic advance-fee fraud','Requesting bank account details','Requesting upfront payment','All email authentication failed','ML model high confidence phishing'], mlConfidence:0.92, vtMaliciousCount:7, spfPass:false, dkimPass:false, dmarcPass:false, receivedAt:new Date(Date.now()-44*60*60*1000) });
    const p4 = await Email.create({ userId:uid, sender:'no-reply@google-account-verify.com', senderDomain:'google-account-verify.com', subject:'Action required: Verify your Google account', body:'We noticed a sign-in attempt to your Google account from an unknown device in Russia. Immediately verify your account by clicking the link and entering your password.', category:'Phishing', riskScore:96, isBlocked:true, threatReasons:['Domain impersonates Google','Fear-based social engineering','Credential harvesting link','SPF DKIM DMARC all failed','VirusTotal malicious domain','ML model highest phishing confidence'], mlConfidence:0.96, vtMaliciousCount:10, spfPass:false, dkimPass:false, dmarcPass:false, receivedAt:new Date(Date.now()-48*60*60*1000) });
    console.log('Phishing emails seeded ✅ (4)');

    // ── ThreatLogs for phishing only ──
    await ThreatLog.create({ emailId:p1.id, mlResult:{risk_score:95, confidence:0.95}, vtResult:{malicious:8}, mxResult:{spf:false,dkim:false,dmarc:false}, authResult:{passed:false}, finalScore:95 });
    await ThreatLog.create({ emailId:p2.id, mlResult:{risk_score:88, confidence:0.88}, vtResult:{malicious:6}, mxResult:{spf:false,dkim:false,dmarc:false}, authResult:{passed:false}, finalScore:88 });
    await ThreatLog.create({ emailId:p3.id, mlResult:{risk_score:92, confidence:0.92}, vtResult:{malicious:7}, mxResult:{spf:false,dkim:false,dmarc:false}, authResult:{passed:false}, finalScore:92 });
    await ThreatLog.create({ emailId:p4.id, mlResult:{risk_score:96, confidence:0.96}, vtResult:{malicious:10}, mxResult:{spf:false,dkim:false,dmarc:false}, authResult:{passed:false}, finalScore:96 });
    console.log('ThreatLogs created ✅ (4)');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SEED COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo user   : demo@securemail.com');
    console.log('Password    : Demo@1234');
    console.log('Emails      : 20 total');
    console.log('  Primary   : 6');
    console.log('  Jobs      : 3');
    console.log('  Personal  : 3');
    console.log('  Promotions: 2');
    console.log('  Spam      : 2');
    console.log('  Phishing  : 4 (isBlocked: true)');
    console.log('ThreatLogs  : 4 (phishing only)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();