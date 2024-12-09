import { createServer } from "http";
import express, { Express } from "express";
import httpProxy from "http-proxy";
import helmet from "helmet";
import { engine } from "express-handlebars";
import passport from "passport";
import session from "express-session";
import path from "path";
import flash from 'connect-flash';
import { registerFormRoutesUser } from "./rutas"; // Importar las rutas definidas
import Handlebars from "handlebars";  // Importar Handlebars para usar los tipos

const port = 5000;
const expressApp: Express = express();

// Configuración del proxy
const proxy = httpProxy.createProxyServer({
  target: "http://localhost:5100", ws: true,  // Redirigir solicitudes WebSocket
});

// Middleware para manejo de datos
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());

// Configurar el motor de plantillas Handlebars
expressApp.set("views", path.join(__dirname, "../../templates/server"));
expressApp.engine("handlebars", engine({
  helpers: {
    ifCond: (a: string, b: string, options: Handlebars.HelperOptions) => {
      if (a === b) {
        return options.fn(this); // Si son iguales, ejecutar el bloque 'fn'
      } else {
        return options.inverse(this); // Si no son iguales, ejecutar el bloque 'inverse'
      }
    }
  }
}));
expressApp.set("view engine", "handlebars");

// Seguridad: proteger la aplicación con Helmet
expressApp.use(helmet());

// Configurar sesiones y Passport para la autenticación
expressApp.use(session({
  secret: "your_secret_key", // Cambiar en producción
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // Desactivar secure en desarrollo
}));

expressApp.use(flash());

expressApp.use(passport.initialize());
expressApp.use(passport.session());

// Rutas para formularios de usuario (registrar, login, etc.)
registerFormRoutesUser(expressApp);

// Servir archivos estáticos como CSS y JS desde la carpeta "static"
expressApp.use(express.static(path.join(__dirname, "../../static")));

// Redirigir la raíz a la página de login
expressApp.get("^/$", (req, res) => res.redirect("/login"));

// Configuración del proxy para todas las demás solicitudes
expressApp.use((req, res) => {
  proxy.web(req, res);
});

expressApp.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],  // Agregar CDN de fuentes
    styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
    fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
}));

expressApp.use('/static', express.static(path.join(__dirname, 'static')));

// Configuración de WebSocket
const server = createServer(expressApp);
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);  // Redirigir solicitudes de WebSocket
});

// Iniciar el servidor en el puerto 5000
server.listen(port, () => {
  console.log(`HTTP Server listening on http://localhost:${port}`);
});
