"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const helmet_1 = __importDefault(require("helmet"));
const express_handlebars_1 = require("express-handlebars");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const passport_config_1 = require("./auth/passport_config"); // Importar la autenticación y roles
const rutas_1 = require("./rutas"); // Suponiendo que las rutas de usuario se manejan aquí
const orm_auth_store_1 = require("./auth/orm_auth_store");
orm_auth_store_1.sequelize.sync({ force: false }).then(() => {
    console.log('Base de datos sincronizada');
}).catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
});
const port = 5000;
const expressApp = (0, express_1.default)();
// Configuración del proxy
const proxy = http_proxy_1.default.createProxyServer({
    target: "http://localhost:5100", ws: true, // Redirigir solicitudes WebSocket
});
// Middleware para manejo de datos
expressApp.use(express_1.default.urlencoded({ extended: true }));
expressApp.use(express_1.default.json());
// Configurar el motor de plantillas Handlebars
expressApp.set("views", path_1.default.join(__dirname, "../../templates/server"));
expressApp.engine("handlebars", (0, express_handlebars_1.engine)());
expressApp.set("view engine", "handlebars");
// Seguridad: proteger la aplicación con Helmet
expressApp.use((0, helmet_1.default)());
// Configurar sesiones y Passport para la autenticación
expressApp.use((0, express_session_1.default)({
    secret: "your_secret_key", // Cambiar en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 } // Desactivar secure en desarrollo
}));
expressApp.use(passport_1.default.initialize());
expressApp.use(passport_1.default.session());
// Rutas para formularios de usuario (registrar, login, etc.)
(0, rutas_1.registerFormRoutesUser)(expressApp);
// Servir archivos estáticos como CSS y JS desde la carpeta "static"
expressApp.use(express_1.default.static(path_1.default.join(__dirname, "../../static")));
// Rutas específicas para servir archivos CSS y JS
expressApp.get('/static/styles.css', (req, res) => {
    res.type('application/css');
    res.sendFile(path_1.default.join(__dirname, "../../static/styles.css"));
});
expressApp.use(express_1.default.static(path_1.default.join(__dirname, "../../src/client")));
expressApp.get('/src/client/client.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path_1.default.join(__dirname, "../../src/client/client.js"));
});
// Política de seguridad de contenido (CSP)
expressApp.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://cdn.jsdelivr.net;");
    next();
});
// Servir Bootstrap desde node_modules
expressApp.use(express_1.default.static(path_1.default.join(__dirname, "../../node_modules/bootstrap/dist")));
// Redirigir la raíz a la página de login
expressApp.get("^/$", (req, res) => res.redirect("/login"));
// Configurar rutas de usuario según los roles
expressApp.get("/admin", passport_config_1.isAuthenticated, (0, passport_config_1.authorize)("administrador"), (req, res) => {
    res.render("menuAdmin");
});
expressApp.get("/cocinero", passport_config_1.isAuthenticated, (0, passport_config_1.authorize)("cocinero"), (req, res) => {
    res.render("menuCocinero");
});
expressApp.get("/mesero", passport_config_1.isAuthenticated, (0, passport_config_1.authorize)("mesero"), (req, res) => {
    res.render("menuMesero");
});
// Configuración del proxy para todas las demás solicitudes
expressApp.use((req, res) => {
    proxy.web(req, res);
});
// Configuración de WebSocket
const server = (0, http_1.createServer)(expressApp);
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head); // Redirigir solicitudes de WebSocket
});
// Iniciar el servidor en el puerto 5000
server.listen(port, () => {
    console.log(`HTTP Server listening on http://localhost:${port}`);
});
