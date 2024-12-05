export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  contraseña: string;
  rol: 'mesero' | 'cocinero' | 'administrador';
}

export interface Mesa {
  id: number;
  numero: number;
  estado: 'disponible' | 'ocupada';
}

export interface Comanda {
  id: number;
  idMesa: number;
  idMesero: number; // Relación con el mesero que crea la comanda
  platillos: string[];
  bebidas: string[];
  notas?: string;
  estado: 'pendiente' | 'en preparación' | 'listo';
}

  
export interface AuthStore {
  crearUsuario(usuario: Usuario): Promise<Usuario>;
  obtenerUsuarioPorCorreo(correo: string): Promise<Usuario | null>;
  validarContraseña(usuario: Usuario, contraseña: string): Promise<boolean>;
  listarUsuarios(): Promise<Usuario[]>;
}  

export interface AuthenticatedRequest extends Request {
  user?: Usuario;  // Usuario autenticado basado en tu interfaz
  isAuthenticated: () => boolean; // Método de Passport
  logout: (callback: (err: any) => void) => void; // Método logout de Passport
}
