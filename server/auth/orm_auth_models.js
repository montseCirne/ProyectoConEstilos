"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = exports.ComandaModel = exports.MesaModel = exports.UsuarioModel = void 0;
const sequelize_1 = require("sequelize");
const orm_auth_store_1 = require("./orm_auth_store");
// Modelo de Usuario
class UsuarioModel extends sequelize_1.Model {
}
exports.UsuarioModel = UsuarioModel;
UsuarioModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    correo: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    contraseña: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    rol: { type: sequelize_1.DataTypes.ENUM('mesero', 'cocinero', 'administrador'), allowNull: false },
}, {
    sequelize: orm_auth_store_1.sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
});
// Modelo de Mesa
class MesaModel extends sequelize_1.Model {
}
exports.MesaModel = MesaModel;
MesaModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: true },
    estado: { type: sequelize_1.DataTypes.ENUM('disponible', 'ocupada'), allowNull: false },
}, {
    sequelize: orm_auth_store_1.sequelize,
    modelName: 'Mesa',
    tableName: 'mesas',
    timestamps: true,
});
// Modelo de Comanda
class ComandaModel extends sequelize_1.Model {
}
exports.ComandaModel = ComandaModel;
ComandaModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idMesa: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MesaModel,
            key: 'id',
        },
    },
    platillos: { type: sequelize_1.DataTypes.JSON, allowNull: false },
    bebidas: { type: sequelize_1.DataTypes.JSON, allowNull: false },
    notas: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    estado: { type: sequelize_1.DataTypes.ENUM('pendiente', 'en preparación', 'listo'), allowNull: false },
    meseroId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: UsuarioModel,
            key: 'id',
        },
        allowNull: false,
    },
}, {
    sequelize: orm_auth_store_1.sequelize,
    modelName: 'Comanda',
    tableName: 'comandas',
    timestamps: true,
});
// Relaciones
MesaModel.hasMany(ComandaModel, { foreignKey: 'idMesa', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(MesaModel, { foreignKey: 'idMesa', as: 'mesa' });
UsuarioModel.hasMany(ComandaModel, { foreignKey: 'meseroId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(UsuarioModel, { foreignKey: 'meseroId', as: 'mesero' });
// Sincronización
const initModels = async () => {
    try {
        await orm_auth_store_1.sequelize.sync({ alter: true });
        console.log('Base de datos sincronizada.');
        console.log('Modelos sincronizados con la base de datos.');
    }
    catch (error) {
        console.error('Error al sincronizar modelos:', error);
    }
};
exports.initModels = initModels;
