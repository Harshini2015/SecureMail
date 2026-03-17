const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Email = sequelize.define('Email', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sender: {
            type: DataTypes.STRING,
            allowNull: false
        },
        senderDomain: {
            type: DataTypes.STRING
        },
        subject: {
            type: DataTypes.STRING
        },
        body: {
            type: DataTypes.TEXT
        },
        category: {
            type: DataTypes.ENUM('Primary', 'Jobs', 'Personal', 'Promotions', 'Spam', 'Phishing'),
            defaultValue: 'Primary'
        },
        riskScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isBlocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        threatReasons: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        mlConfidence: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        vtMaliciousCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        spfPass: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        dkimPass: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        dmarcPass: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        receivedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'emails',
        timestamps: false
    });

    return Email;
};