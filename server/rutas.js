"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFormRoutesUser = registerFormRoutesUser;
const passport_1 = __importDefault(require("passport"));
const passport_config_1 = require("./auth/passport_config"); // Importar isAuthenticated para proteger las rutas
// Aquí registrarás las rutas del formulario de login, registro, etc.
function registerFormRoutesUser(app) {
    // Ruta para el formulario de login
    app.get("/login", (req, res) => {
        res.render("login");
    });
    // Ruta para procesar el login
    app.post("/login", passport_1.default.authenticate("local", {
        successRedirect: "/dashboard", // Redirigir al dashboard después de un login exitoso
        failureRedirect: "/login", // Redirigir al login si falla
        failureFlash: true
    }));
    // Ruta para el dashboard, solo accesible para usuarios autenticados
    app.get("/dashboard", passport_config_1.isAuthenticated, (req, res) => {
        res.render("menuUser", { user: req.user });
    });
}
