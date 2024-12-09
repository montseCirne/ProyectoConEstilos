"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarUsuario = registrarUsuario;
exports.registerFormRoutesUser = registerFormRoutesUser;
const passport_1 = __importDefault(require("passport"));
const passport_config_1 = require("./auth/passport_config");
const orm_auth_store_1 = require("./auth/orm_auth_store");
const orm_auth_models_1 = require("./auth/orm_auth_models");
const helmet_1 = __importDefault(require("helmet"));
const bcrypt = require('bcrypt');
function obtenerRol(req) {
    return req.user ? req.user.rol : undefined;
}
async function registrarUsuario(req, res, next) {
    const { nombre, correo, contrasena, rol } = req.body;
    // Validación de los campos
    if (!nombre || !correo || !contrasena || !rol) {
        req.flash('error', 'Todos los campos son requeridos.');
        return res.redirect('/admin'); // Redirigir al formulario con el mensaje de error
    }
    const store = new orm_auth_store_1.AuthStore(); // Crear una instancia de AuthStore
    try {
        // Usamos la función storeOrUpdateUser para crear o actualizar el usuario
        await store.storeOrUpdateUser(nombre, correo, contrasena, rol);
        // Establecer un mensaje de éxito con flash
        req.flash('success', '¡Usuario creado con éxito!');
        // Redirigir después de crear el usuario
        res.redirect("/admin");
    }
    catch (err) {
        console.error("Error al crear el usuario: ", err);
        req.flash('error', 'Hubo un error al crear el usuario.');
        res.redirect('/admin'); // Redirigir al formulario con el mensaje de error
    }
}
// Registrar las rutas
function registerFormRoutesUser(app) {
    // Ruta para el formulario de login
    app.get("/login", (req, res) => {
        res.render("login");
    });
    // Ruta para procesar el login
    app.post("/login", passport_1.default.authenticate("local", {
        successRedirect: '/redirect', // Redirige al endpoint deseado si el login es exitoso
        failureRedirect: '/', // Redirige a la página de login si el login falla
        failureFlash: true
    }), (req, res) => {
        console.log('Usuario autenticado', req.user); // Aquí puedes revisar el estado del usuario
    });
    // Ruta para registrar un nuevo usuario
    app.post("/admin/crearUsuario", registrarUsuario);
    // Ruta para redirigir según el rol del usuario
    app.get("/redirect", passport_config_1.isAuthenticated, (req, res) => {
        const rol = obtenerRol(req);
        console.log(`Usuario con rol ${rol} está siendo redirigido`);
        if (rol) {
            // Redirige según el rol del usuario
            switch (rol) {
                case 'administrador':
                    res.redirect('/admin');
                    break;
                case 'mesero':
                    res.redirect('/mesero');
                    break;
                case 'cocinero':
                    res.redirect('/cocinero');
                    break;
                default:
                    res.redirect('/login'); // Si no tiene rol o hay un error
                    console.log("No se pudo determinar el rol del usuario. Redirigiendo al login.");
            }
        }
        else {
            res.redirect('/login'); // Si no hay usuario autenticado
            console.log("No se pudo determinar el rol del usuario. Redirigiendo al login.");
        }
    });
    // Rutas para los menús, accesibles solo para usuarios autenticados y con el rol adecuado
    app.get("/admin", passport_config_1.isAuthenticated, async (req, res) => {
        const rol = obtenerRol(req);
        if (rol === 'administrador') {
            try {
                const mesas = await orm_auth_models_1.MesaModel.findAll();
                const usuarios = await orm_auth_models_1.UsuarioModel.findAll();
                res.render("menuAdmin", {
                    user: req.user,
                    success: req.flash('success'),
                    error: req.flash('error'),
                    mesas: mesas,
                    usuarios: usuarios
                });
            }
            catch (err) {
                console.error("Error al obtener las mesas: ", err);
                res.status(500).send("Error al obtener las mesas");
            }
        }
        else {
            res.status(403).send("Acceso no autorizado");
        }
    });
    app.get("/mesero", passport_config_1.isAuthenticated, (req, res) => {
        const rol = obtenerRol(req);
        if (rol === 'mesero') {
            res.render("menuMesero", { user: req.user });
        }
        else {
            res.status(403).send("Acceso no autorizado");
        }
    });
    app.get("/cocinero", passport_config_1.isAuthenticated, (req, res) => {
        const rol = obtenerRol(req);
        if (rol === 'cocinero') {
            res.render("menuCocinero", { user: req.user });
        }
        else {
            res.status(403).send("Acceso no autorizado");
        }
    });
    app.use(helmet_1.default.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"], // Agregar CDN de fuentes
            styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }));
    // Ruta para cambiar el estado de la mesa a "disponible"
    app.post('/mesas/:id/disponible', async (req, res) => {
        try {
            const mesaId = req.params.id;
            await orm_auth_models_1.MesaModel.update({ estado: 'disponible' }, { where: { id: mesaId } });
            res.redirect('/admin');
        }
        catch (error) {
            console.error(error);
            res.redirect('/admin?error=Error al actualizar el estado de la mesa');
        }
    });
    // Ruta para cambiar el estado de la mesa a "ocupada"
    app.post('/mesas/:id/ocupada', async (req, res) => {
        try {
            const mesaId = req.params.id;
            await orm_auth_models_1.MesaModel.update({ estado: 'ocupada' }, { where: { id: mesaId } });
            res.redirect('/admin');
        }
        catch (error) {
            console.error(error);
            res.redirect('/admin?error=Error al actualizar el estado de la mesa');
        }
    });
    //PASAR A LA VSTA
    app.get('/usuarios/:id/editar', async (req, res) => {
        try {
            const usuarioId = req.params.id;
            const usuario = await orm_auth_models_1.UsuarioModel.findByPk(usuarioId);
            if (!usuario) {
                return res.redirect('/admin?error=Usuario no encontrado');
            }
            // Preparamos los valores del rol para pasarlos a la vista
            const roles = ['mesero', 'cocinero', 'administrador'];
            res.render('editarUsuario', {
                usuario,
                roles, // Pasamos los roles para la vista
            });
        }
        catch (error) {
            console.error('Error al recuperar el usuario:', error);
            res.redirect('/admin?error=Error al cargar los datos del usuario');
        }
    });
    // Ruta para eliminar un usuario
    app.post('/usuarios/:id/eliminar', async (req, res) => {
        try {
            const usuarioId = req.params.id;
            await orm_auth_models_1.UsuarioModel.destroy({ where: { id: usuarioId } });
            res.redirect('/admin?success=Usuario eliminado exitosamente');
        }
        catch (error) {
            console.error('Error al eliminar el usuario:', error);
            res.redirect('/admin?error=Error al eliminar el usuario');
        }
    });
    app.post('/usuarios/:id/editar', async (req, res) => {
        try {
            const usuarioId = req.params.id;
            const { nombre, correo, contrasena, rol } = req.body;
            // Encriptar la contraseña solo si se ha proporcionado una nueva
            let hashedPassword;
            if (contrasena) {
                hashedPassword = await bcrypt.hash(contrasena, 10);
            }
            // Actualizamos los datos del usuario, asegurándonos de no sobrescribir la contraseña si no fue proporcionada
            await orm_auth_models_1.UsuarioModel.update({
                nombre,
                correo,
                contraseña: hashedPassword || undefined, // Solo actualizamos la contraseña si se ha proporcionado
                rol,
            }, { where: { id: usuarioId } });
            res.redirect('/admin?success=Usuario actualizado exitosamente');
        }
        catch (error) {
            console.error('Error al actualizar el usuario:', error);
            res.redirect('/admin?error=Error al actualizar el usuario');
        }
    });
}
