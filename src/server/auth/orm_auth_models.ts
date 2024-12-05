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

// Modelo de Comanda
export class ComandaModel extends Model {
  declare id: number;
  declare idMesa: number;
  declare platillos: string[];
  declare bebidas: string[];
  declare notas?: string;
  declare estado: 'pendiente' | 'en preparación' | 'listo';
  declare meseroId: number; // Referencia al mesero
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
    platillos: { type: DataTypes.JSON, allowNull: false },
    bebidas: { type: DataTypes.JSON, allowNull: false },
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
MesaModel.hasMany(ComandaModel, { foreignKey: 'idMesa', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(MesaModel, { foreignKey: 'idMesa', as: 'mesa' });

UsuarioModel.hasMany(ComandaModel, { foreignKey: 'meseroId', as: 'comandas', onDelete: 'CASCADE' });
ComandaModel.belongsTo(UsuarioModel, { foreignKey: 'meseroId', as: 'mesero' });

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