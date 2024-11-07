const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const User = require('./User');
const Video = require('./Video');

const Rating = sequelize.define('Rating', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    iduser: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',  // Clave primaria del modelo "User"
        },
        allowNull: false,
    },
    idvideo: {
        type: DataTypes.INTEGER,
        references: {
            model: Video,
            key: 'idvideo',  // Referencia a la clave primaria "idvideo" del modelo "Video"
        },
        allowNull: false,
    }
}, {
    timestamps: true,
    tableName: 'ratings'
});

Rating.belongsTo(User, { foreignKey: 'iduser' });
Rating.belongsTo(Video, { foreignKey: 'idvideo' });

module.exports = Rating;
