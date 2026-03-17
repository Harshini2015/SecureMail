const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ThreatLog = sequelize.define('ThreatLog', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        emailId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mlResult: {
            type: DataTypes.JSONB
        },
        vtResult: {
            type: DataTypes.JSONB
        },
        mxResult: {
            type: DataTypes.JSONB
        },
        authResult: {
            type: DataTypes.JSONB
        },
        finalScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'threatlogs',
        timestamps: false
    });

    return ThreatLog;
};