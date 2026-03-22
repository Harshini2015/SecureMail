const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: { isEmail: true }
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        login_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        locked_until: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        resetToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        resetTokenExpiry: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: false
    });

    // Auto-hash password before saving
    User.beforeCreate(async (user) => {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
    });

    // Instance method to compare password on login
    User.prototype.comparePassword = function (plain) {
        return bcrypt.compare(plain, this.passwordHash);
    };

    return User;
};