require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sequelize, User, Email, ThreatLog } = require('../models/index');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to Database for seeding...');

        // 1. Create Test User
        const testEmail = 'test@example.com';
        let user = await User.findOne({ where: { email: testEmail } });
        
        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                email: testEmail,
                passwordHash: 'test123' // Will be hashed by beforeCreate hook
            });
        }
        console.log(`User ID: ${user.id}`);

        // 2. Clear existing emails for this user (optional, for clean seed)
        // await Email.destroy({ where: { userId: user.id } });

        // 3. Create Sample Emails
        console.log('Creating sample emails...');
        const sampleEmails = [
            {
                userId: user.id,
                sender: 'hr@bigtech.com',
                senderDomain: 'bigtech.com',
                subject: 'Job Opportunity: Senior Developer',
                body: 'We saw your profile and are interested in hiring you...',
                category: 'Jobs',
                riskScore: 5,
                isBlocked: false,
                receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                userId: user.id,
                sender: 'no-reply@amazon.com',
                senderDomain: 'amazon.com',
                subject: 'Your Order #12345 has shipped',
                body: 'Good news! Your package is on its way...',
                category: 'Primary',
                riskScore: 0,
                isBlocked: false,
                receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
            },
            {
                userId: user.id,
                sender: 'bank-security@phish-alert.net',
                senderDomain: 'phish-alert.net',
                subject: 'URGENT: Your account is suspended',
                body: 'Please click here to verify your identity or your funds will be frozen.',
                category: 'Phishing',
                riskScore: 95,
                isBlocked: true,
                threatReasons: ['Suspicious link', 'Urgent language', 'Unknown sender'],
                mlConfidence: 0.98,
                receivedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
            },
            {
                userId: user.id,
                sender: 'marketing@cheap-pills.biz',
                senderDomain: 'cheap-pills.biz',
                subject: 'Save 50% on all vitamins!',
                body: 'Limited time offer! Get your supplements now.',
                category: 'Spam',
                riskScore: 60,
                isBlocked: false,
                receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            }
        ];

        for (const emailData of sampleEmails) {
            const email = await Email.create(emailData);
            
            // Create a basic ThreatLog for each
            await ThreatLog.create({
                emailId: email.id,
                finalScore: email.riskScore,
                mlResult: { score: email.riskScore, confidence: email.mlConfidence || 0 },
                createdAt: email.receivedAt
            });
        }

        console.log('✅ Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seed();