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
    app.get("/admin", passport_config_1.isAuthenticated, (req, res) => {
        const rol = obtenerRol(req);
        if (rol === 'administrador') {
            res.render("menuAdmin", { user: req.user, success: req.flash('success'), error: req.flash('error') });
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
}
