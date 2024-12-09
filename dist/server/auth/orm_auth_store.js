"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthStore = exports.Comanda = exports.Mesa = exports.Usuario = exports.sequelize = void 0;
exports.obtenerTodasLasComandas = obtenerTodasLasComandas;
const sequelize_1 = require("sequelize");
const bcrypt = require('bcrypt');
// Configuración de la base de datos
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: 'restaurante.bd',
    logging: console.log,
});
// Modelo de Usuario
exports.Usuario = exports.sequelize.define('Usuario', {
    nombre: sequelize_1.DataTypes.STRING,
    correo: sequelize_1.DataTypes.STRING,
    contraseña: sequelize_1.DataTypes.STRING,
    rol: sequelize_1.DataTypes.ENUM('mesero', 'cocinero', 'administrador'),
});
// Modelo de Mesa
exports.Mesa = exports.sequelize.define('Mesa', {
    numero: sequelize_1.DataTypes.INTEGER,
    estado: sequelize_1.DataTypes.ENUM('disponible', 'ocupada'),
});
// Modelo de Comanda
exports.Comanda = exports.sequelize.define('Comanda', {
    idMesa: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: exports.Mesa,
            key: 'id',
        },
    },
    platillos: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false
    },
    bebidas: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false
    },
    notas: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM('pendiente', 'en preparación', 'listo'),
        allowNull: false
    },
    meseroId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: exports.Usuario,
            key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false
    },
});
class AuthStore {
    // Crear o actualizar usuario
    async storeOrUpdateUser(nombre, correo, contraseña, rol) {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        await exports.Usuario.upsert({
            nombre,
            correo,
            contraseña: hashedPassword,
            rol,
        });
    }
    // Eliminar un usuario
    async deleteUser(correo) {
        await exports.Usuario.destroy({ where: { correo } });
    }
    // Listar todos los usuarios
    async listUsers() {
        return await exports.Usuario.findAll();
    }
    // Crear o actualizar una mesa
    async storeOrUpdateTable(numero, estado) {
        await exports.Mesa.upsert({ numero, estado });
    }
    // Eliminar una mesa
    async deleteTable(numero) {
        await exports.Mesa.destroy({ where: { numero } });
    }
    // Listar todas las mesas
    async listTables() {
        return await exports.Mesa.findAll();
    }
    // Crear o actualizar una comanda
    async storeOrUpdateComanda(idMesa, meseroId, platillos, bebidas, notas, estado) {
        await exports.Comanda.upsert({
            idMesa,
            meseroId,
            platillos,
            bebidas,
            notas,
            estado,
        });
    }
    // Eliminar una comanda
    async deleteComanda(id) {
        try {
            await exports.Comanda.destroy({ where: { id } });
        }
        catch (error) {
            console.error('Error al eliminar la comanda:', error);
        }
    }
    // Listar todas las comandas
    async listComandas() {
        return await exports.Comanda.findAll();
    }
    // Inicializar la base de datos con datos por defecto
    async initModelAndDatabase() {
        try {
            await exports.sequelize.sync({ alter: true }); // Sincroniza las tablas, pero no borra datos
            console.log('Modelos sincronizados con la base de datos.');
            // Inicializar datos por defecto
            await this.storeOrUpdateUser('Erik', 'eriklopez@gmail.com', '1234', 'mesero');
            await this.storeOrUpdateUser('Eber', 'eber@gmail.com', 'mysecret', 'cocinero');
            await this.storeOrUpdateUser('Tiberio', 'tibi@gmail.com', 'mysecret', 'administrador');
            // Inicialización de mesas por defecto
            const defaultTables = [];
            for (let i = 1; i <= 10; i++) {
                defaultTables.push(this.storeOrUpdateTable(i, 'disponible'));
            }
            await Promise.all(defaultTables);
            console.log('Base de datos inicializada con usuarios y mesas por defecto.');
        }
        catch (error) {
            console.error('Error al sincronizar o inicializar la base de datos:', error);
        }
    }
}
exports.AuthStore = AuthStore;
async function obtenerTodasLasComandas() {
    try {
        const comandas = await exports.Comanda.findAll({
            include: [
                {
                    model: exports.Usuario, // Información del mesero que realizó la comanda
                    as: 'mesero',
                    attributes: ['nombre', 'correo']
                }
            ]
        });
        return comandas;
    }
    catch (error) {
        console.error('Error al obtener las comandas:', error);
        throw new Error('No se pudieron obtener las comandas');
    }
}
// Ejemplo de inicialización de la base de datos
(async () => {
    const store = new AuthStore();
    await store.initModelAndDatabase();
})();
