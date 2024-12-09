import { Express } from "express";
import passport from "passport";
import { isAuthenticated } from "./auth/passport_config"; 
import { Request, Response, NextFunction} from "express";
import { UsuarioModel } from "./auth/orm_auth_models";
import bcrypt from 'bcrypt';

function obtenerRol(req: any): string | undefined {
  return req.user ? req.user.rol : undefined;
}

// Registrar un nuevo usuario
export async function registrarUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { nombre, correo, contrasena, rol } = req.body;

  // Validaciones básicas (se pueden extender)
  if (!nombre || !correo || !contrasena || !rol) {
    res.status(400).send("Todos los campos son requeridos.");
  }

  try {
    // Cifrar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear un nuevo usuario
    const nuevoUsuario = new UsuarioModel({
      nombre,
      correo,
      contrasena: hashedPassword, // Guardamos la contraseña cifrada
      rol,
    });

    // Guardar el usuario en la base de datos
    await nuevoUsuario.save();
    res.redirect("/admin");  // Redirigir a la página de administración después de crear el usuario

  } catch (err) {
    console.error("Error al crear el usuario: ", err);
    res.status(500).send("Hubo un error al crear el usuario.");
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
      res.render("menuAdmin", { user: req.user });
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
}
