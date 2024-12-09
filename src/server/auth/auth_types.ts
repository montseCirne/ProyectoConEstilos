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

// Interfaz de Platillo
export interface Platillo {
  id: number;
  nombre: string;
  precio: number;
}

// Interfaz de Bebida
export interface Bebida {
  id: number;
  nombre: string;
  precio: number;
}

// Interfaz de Comanda
export interface Comanda {
  id: number;
  idMesa: number;
  idMesero: number; 
  platillos: { platilloId: number; cantidad: number }[];  
  bebidas: { bebidaId: number; cantidad: number }[];     
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
