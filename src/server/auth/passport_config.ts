import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { UsuarioModel } from './orm_auth_models';  // Asegúrate de tener el modelo correctamente importado
import { Usuario } from './auth_types';

// Configuración de la estrategia local para autenticación
passport.use(
  new LocalStrategy(
    {
      usernameField: 'correo',   // Define el campo 'correo' como el nombre de usuario
      passwordField: 'contraseña',  // Define el campo 'contraseña' como el campo de contraseña
    },
    async (correo, contraseña, done) => {
      try {
        // Busca al usuario por correo
        const usuario = await UsuarioModel.findOne({ where: { correo } });
        if (!usuario) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        // Compara la contraseña encriptada
        const isValid = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!isValid) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

        // Si todo está bien, se retorna el usuario sin la contraseña
        return done(null, {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialización del usuario en la sesión
passport.serializeUser((user: any, done) => {
  done(null, user.id);  // Guardamos solo el ID del usuario en la sesión
});

// Deserialización del usuario de la sesión
passport.deserializeUser(async (id: number, done) => {
  try {
    const usuario = await UsuarioModel.findByPk(id);
    if (!usuario) {
      return done(null, false);
    }
    done(null, {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,  // Asegúrate de que el rol esté incluido aquí
    });
  } catch (error) {
    done(error);
  }
});


// Middleware para verificar si el usuario está autenticado
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'No autenticado' });
}

// Middleware para verificar si el usuario tiene el rol adecuado
export function authorize(role: 'mesero' | 'cocinero' | 'administrador') {
  return (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.rol === role) {
      return next();
    }
    res.status(403).json({ error: 'No autorizado' });
  };
}
