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
const connect_flash_1 = __importDefault(require("connect-flash"));
const rutas_1 = require("./rutas"); // Importar las rutas definidas
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
expressApp.engine("handlebars", (0, express_handlebars_1.engine)({
    helpers: {
        ifCond: (a, b, options) => {
            if (a === b) {
                return options.fn(this); // Si son iguales, ejecutar el bloque 'fn'
            }
            else {
                return options.inverse(this); // Si no son iguales, ejecutar el bloque 'inverse'
            }
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true, // Desactiva la restricción de acceso al prototipo
    }
}));
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
expressApp.use((0, connect_flash_1.default)());
expressApp.use(passport_1.default.initialize());
expressApp.use(passport_1.default.session());
// Rutas para formularios de usuario (registrar, login, etc.)
(0, rutas_1.registerFormRoutesUser)(expressApp);
// Servir archivos estáticos como CSS y JS desde la carpeta "static"
expressApp.use(express_1.default.static(path_1.default.join(__dirname, "../../static")));
// Redirigir la raíz a la página de login
expressApp.get("^/$", (req, res) => res.redirect("/login"));
// Configuración del proxy para todas las demás solicitudes
expressApp.use((req, res) => {
    proxy.web(req, res);
});
expressApp.use(helmet_1.default.contentSecurityPolicy({
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
expressApp.use('/static', express_1.default.static(path_1.default.join(__dirname, 'static')));
// Configuración de WebSocket
const server = (0, http_1.createServer)(expressApp);
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head); // Redirigir solicitudes de WebSocket
});
// Iniciar el servidor en el puerto 5000
server.listen(port, () => {
    console.log(`HTTP Server listening on http://localhost:${port}`);
});
