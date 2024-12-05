"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = isAuthenticated;
exports.authorize = authorize;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const orm_auth_models_1 = require("./orm_auth_models"); // Asegúrate de tener el modelo correctamente importado
// Configuración de la estrategia local para autenticación
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'correo', // Define el campo 'correo' como el nombre de usuario
    passwordField: 'contraseña', // Define el campo 'contraseña' como el campo de contraseña
}, async (correo, contraseña, done) => {
    try {
        // Busca al usuario por correo
        const usuario = await orm_auth_models_1.UsuarioModel.findOne({ where: { correo } });
        if (!usuario) {
            return done(null, false, { message: 'Usuario no encontrado' });
        }
        // Compara la contraseña encriptada
        const isValid = await bcrypt_1.default.compare(contraseña, usuario.contraseña);
        if (!isValid) {
            return done(null, false, { message: 'Contraseña incorrecta' });
        }
        // Si todo está bien, se retorna el usuario sin la contraseña
        return done(null, {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
        });
    }
    catch (error) {
        return done(error);
    }
}));
// Serialización del usuario en la sesión
passport_1.default.serializeUser((user, done) => {
    done(null, user.id); // Guardamos solo el ID del usuario en la sesión
});
// Deserialización del usuario de la sesión
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const usuario = await orm_auth_models_1.UsuarioModel.findByPk(id);
        if (!usuario) {
            return done(null, false);
        }
        done(null, {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol, // Asegúrate de que el rol esté incluido aquí
        });
    }
    catch (error) {
        done(error);
    }
});
// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'No autenticado' });
}
// Middleware para verificar si el usuario tiene el rol adecuado
function authorize(role) {
    return (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol === role) {
            return next();
        }
        res.status(403).json({ error: 'No autorizado' });
    };
}
