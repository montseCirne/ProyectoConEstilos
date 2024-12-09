import { Express } from "express";
import passport from "passport";
import { isAuthenticated } from "./auth/passport_config"; 
import { Request, Response, NextFunction} from "express";
import { AuthStore } from './auth/orm_auth_store'; 
import { MesaModel } from './auth/orm_auth_models';
import helmet from "helmet";

function obtenerRol(req: any): string | undefined {
  return req.user ? req.user.rol : undefined;
}

export async function registrarUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { nombre, correo, contrasena, rol } = req.body;

  // Validación de los campos
  if (!nombre || !correo || !contrasena || !rol) {
    req.flash('error', 'Todos los campos son requeridos.');
    return res.redirect('/admin'); // Redirigir al formulario con el mensaje de error
  }

  const store = new AuthStore();  // Crear una instancia de AuthStore

  try {
    // Usamos la función storeOrUpdateUser para crear o actualizar el usuario
    await store.storeOrUpdateUser(nombre, correo, contrasena, rol);

    // Establecer un mensaje de éxito con flash
    req.flash('success', '¡Usuario creado con éxito!');

    // Redirigir después de crear el usuario
    res.redirect("/admin");

  } catch (err) {
    console.error("Error al crear el usuario: ", err);
    req.flash('error', 'Hubo un error al crear el usuario.');
    res.redirect('/admin'); // Redirigir al formulario con el mensaje de error
  }
}

// Registrar las rutas
export function registerFormRoutesUser(app: Express) {
  // Ruta para el formulario de login
  app.get("/login", (req, res) => {
    res.render("login");
  });

  // Ruta para procesar el login
  app.post("/login", passport.authenticate("local", {
    successRedirect: '/redirect',  // Redirige al endpoint deseado si el login es exitoso
    failureRedirect: '/',           // Redirige a la página de login si el login falla
    failureFlash: true 
  }), (req, res) => {
    console.log('Usuario autenticado', req.user);  // Aquí puedes revisar el estado del usuario
  });

  // Ruta para registrar un nuevo usuario
  app.post("/admin/crearUsuario", registrarUsuario);

  // Ruta para redirigir según el rol del usuario
  app.get("/redirect", isAuthenticated, (req, res) => {
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
          res.redirect('/login');  // Si no tiene rol o hay un error
          console.log("No se pudo determinar el rol del usuario. Redirigiendo al login.");
      }
    } else {
      res.redirect('/login');  // Si no hay usuario autenticado
      console.log("No se pudo determinar el rol del usuario. Redirigiendo al login.");
    }
  });

  // Rutas para los menús, accesibles solo para usuarios autenticados y con el rol adecuado
  app.get("/admin", isAuthenticated, (req, res) => {
    const rol = obtenerRol(req);
    if (rol === 'administrador') {
      res.render("menuAdmin", { 
        user: req.user, 
        success: req.flash('success'), 
        error: req.flash('error') });
    } else {
      res.status(403).send("Acceso no autorizado");
    }
  });

  app.get("/mesero", isAuthenticated, (req, res) => {
    const rol = obtenerRol(req);
    if (rol === 'mesero') {
      res.render("menuMesero", { user: req.user });
    } else {
      res.status(403).send("Acceso no autorizado");
    }
  });

  app.get("/cocinero", isAuthenticated, (req, res) => {
    const rol = obtenerRol(req);
    if (rol === 'cocinero') {
      res.render("menuCocinero", { user: req.user });
    } else {
      res.status(403).send("Acceso no autorizado");
    }
  });

  app.get("/admin", isAuthenticated, async (req, res) => {
    const rol = obtenerRol(req);
    if (rol === 'administrador') {
      try {
        // Obtener todas las mesas desde la base de datos
        const mesas = await MesaModel.findAll();  // Asegúrate de que este método esté disponible con tu ORM
  
        res.render("menuAdmin", { 
          user: req.user, 
          success: req.flash('success'), 
          error: req.flash('error'),
          mesas: mesas // Pasar las mesas a la vista
        });
      } catch (err) {
        console.error("Error al obtener las mesas: ", err);
        res.status(500).send("Error al obtener las mesas");
      }
    } else {
      res.status(403).send("Acceso no autorizado");
    }
  });

  app.use(helmet.contentSecurityPolicy({
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
  
  
  
}