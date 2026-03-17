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
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'users',
        timestamps: false
    });

    // Auto-hash password before saving
    User.beforeCreate(async (user) => {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    });

    // Instance method to compare password on login
    User.prototype.comparePassword = function (plain) {
        return bcrypt.compare(plain, this.passwordHash);
    };

    return User;
};