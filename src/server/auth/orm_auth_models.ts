import { DataTypes, Model } from 'sequelize';
import { sequelize } from './orm_auth_store';

// Modelo de Usuario
export class UsuarioModel extends Model {
  declare id: number;
  declare nombre: string;
  declare correo: string;
  declare contraseña: string;
  declare rol: 'mesero' | 'cocinero' | 'administrador';
}

UsuarioModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    correo: { type: DataTypes.STRING, allowNull: false, unique: true },
    contraseña: { type: DataTypes.STRING, allowNull: false },
    rol: { type: DataTypes.ENUM('mesero', 'cocinero', 'administrador'), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
  }
);

// Modelo de Mesa
export class MesaModel extends Model {
  declare id: number;
  declare numero: number;
  declare estado: 'disponible' | 'ocupada';
}

MesaModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    estado: { type: DataTypes.ENUM('disponible', 'ocupada'), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Mesa',
    tableName: 'mesas',
    timestamps: true,
  }
);

// Modelo de Platillo
export class PlatilloModel extends Model {
  declare id: number;
  declare nombre: string;
  declare precio: number;
}

PlatilloModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    precio: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Platillo',
    tableName: 'platillos',
    timestamps: true,
  }
);

// Modelo de Bebida
export class BebidaModel extends Model {
  declare id: number;
  declare nombre: string;
  declare precio: number;
}

BebidaModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    precio: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Bebida',
    tableName: 'bebidas',
    timestamps: true,
  }
);

// Modelo de Comanda
export class ComandaModel extends Model {
  declare id: number;
  declare idMesa: number;
  declare platillos: { platilloId: number; cantidad: number }[];  // Array con id y cantidad de cada platillo
  declare bebidas: { bebidaId: number; cantidad: number }[];      // Array con id y cantidad de cada bebida
  declare notas?: string;
  declare estado: 'pendiente' | 'en preparación' | 'listo';
  declare meseroId: number;
}

ComandaModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idMesa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MesaModel,
        key: 'id',
      },
    },
    platillos: { 
      type: DataTypes.JSON, 
      allowNull: false, 
      defaultValue: [], // Por si no se asignan platillos
    },
    bebidas: { 
      type: DataTypes.JSON, 
      allowNull: false, 
      defaultValue: [], // Por si no se asignan bebidas
    },
    notas: { type: DataTypes.STRING, allowNull: true },
    estado: { type: DataTypes.ENUM('pendiente', 'en preparación', 'listo'), allowNull: false },
    meseroId: {
      type: DataTypes.INTEGER,
      references: {
        model: UsuarioModel,
        key: 'id',
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comanda',
    tableName: 'comandas',
    timestamps: true,
  }
);


// Relaciones
// Relaciones entre Mesa y Comanda
MesaModel.hasMany(ComandaModel, { foreignKey: 'idMesa', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(MesaModel, { foreignKey: 'idMesa', as: 'mesa' });

// Relaciones entre Usuario (Mesero) y Comanda
UsuarioModel.hasMany(ComandaModel, { foreignKey: 'meseroId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(UsuarioModel, { foreignKey: 'meseroId', as: 'mesero' });

// Relación entre Platillo y Comanda (Indirecta, usando el campo platillos con id y cantidad)
PlatilloModel.hasMany(ComandaModel, { foreignKey: 'platilloId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(PlatilloModel, { foreignKey: 'platilloId', as: 'platillos' });

// Relación entre Bebida y Comanda (Indirecta, usando el campo bebidas con id y cantidad)
BebidaModel.hasMany(ComandaModel, { foreignKey: 'bebidaId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(BebidaModel, { foreignKey: 'bebidaId', as: 'bebidas' });


// Sincronización
export const initModels = async () => {
  try {
    await sequelize.sync({alter: true}); 
    console.log('Base de datos sincronizada.');
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
  }
};