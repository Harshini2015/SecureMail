const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false  // Required for Neon
        }
    },
    logging: false
});

// Import models using factory pattern (avoids circular dependency)
const User = require('./User')(sequelize);
const Email = require('./Email')(sequelize);
const ThreatLog = require('./ThreatLog')(sequelize);

// Associations
User.hasMany(Email, { foreignKey: 'userId' });
Email.belongsTo(User, { foreignKey: 'userId' });
Email.hasOne(ThreatLog, { foreignKey: 'emailId' });
ThreatLog.belongsTo(Email, { foreignKey: 'emailId' });

module.exports = { sequelize, User, Email, ThreatLog };