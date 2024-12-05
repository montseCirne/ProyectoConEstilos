"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFormRoutesUser = registerFormRoutesUser;
const passport_1 = __importDefault(require("passport"));
const passport_config_1 = require("./auth/passport_config");
function obtenerRol(req) {
    return req.user ? req.user.rol : undefined;
}
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
            res.render("menuAdmin", { user: req.user });
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
