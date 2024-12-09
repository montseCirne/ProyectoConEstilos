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
                console.log(mesas);
                res.render("menuAdmin", {
                    user: req.user,
                    success: req.flash('success'),
                    error: req.flash('error'),
                    mesas: mesas
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
    // Ruta para cambiar el estado de la mesa a "disponible"
    app.post('/mesas/:id/disponible', async (req, res) => {
        try {
            const mesaId = req.params.id;
            await orm_auth_models_1.MesaModel.update({ estado: 'disponible' }, { where: { id: mesaId } });
            // Responde con éxito y el nuevo estado de la mesa
            res.json({ success: true, estado: 'disponible', mesaId: mesaId });
        }
        catch (error) {
            console.error(error);
            res.json({ success: false, error: 'Error al actualizar el estado de la mesa' });
        }
    });
    // Ruta para cambiar el estado de la mesa a "ocupada"
    app.post('/mesas/:id/ocupada', async (req, res) => {
        try {
            const mesaId = req.params.id;
            await orm_auth_models_1.MesaModel.update({ estado: 'ocupada' }, { where: { id: mesaId } });
            // Responde con éxito y el nuevo estado de la mesa
            res.json({ success: true, estado: 'ocupada', mesaId: mesaId });
        }
        catch (error) {
            console.error(error);
            res.json({ success: false, error: 'Error al actualizar el estado de la mesa' });
        }
    });
}
