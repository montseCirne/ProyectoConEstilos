"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = exports.ComandaModel = exports.BebidaModel = exports.PlatilloModel = exports.MesaModel = exports.UsuarioModel = void 0;
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
// Modelo de Platillo
class PlatilloModel extends sequelize_1.Model {
}
exports.PlatilloModel = PlatilloModel;
PlatilloModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    precio: { type: sequelize_1.DataTypes.FLOAT, allowNull: false },
}, {
    sequelize: orm_auth_store_1.sequelize,
    modelName: 'Platillo',
    tableName: 'platillos',
    timestamps: true,
});
// Modelo de Bebida
class BebidaModel extends sequelize_1.Model {
}
exports.BebidaModel = BebidaModel;
BebidaModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    precio: { type: sequelize_1.DataTypes.FLOAT, allowNull: false },
}, {
    sequelize: orm_auth_store_1.sequelize,
    modelName: 'Bebida',
    tableName: 'bebidas',
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
    platillos: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [], // Por si no se asignan platillos
    },
    bebidas: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [], // Por si no se asignan bebidas
    },
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
// Relaciones entre Mesa y Comanda
MesaModel.hasMany(ComandaModel, { foreignKey: 'idMesa', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(MesaModel, { foreignKey: 'idMesa', as: 'mesa' });
// Relaciones entre Usuario (Mesero) y Comanda
UsuarioModel.hasMany(ComandaModel, { foreignKey: 'meseroId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(UsuarioModel, { foreignKey: 'meseroId', as: 'mesero' });
// Relación entre Platillo y Comanda (Indirecta, usando el campo platillos con id y cantidad)
PlatilloModel.hasMany(ComandaModel, { foreignKey: 'platilloId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(PlatilloModel, { foreignKey: 'platilloId', as: 'platillosComanda' }); // Cambié 'platillos' a 'platillosComanda'
// Relación entre Bebida y Comanda (Indirecta, usando el campo bebidas con id y cantidad)
BebidaModel.hasMany(ComandaModel, { foreignKey: 'bebidaId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(BebidaModel, { foreignKey: 'bebidaId', as: 'bebidasComanda' }); // Cambié 'bebidas' a 'bebidasComanda'
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
