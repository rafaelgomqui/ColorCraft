export interface User {
  id: number;
  nombre: string;
  correo: string;
  usuario: string;
  contraseña: string;
  created_at?: string;
}

export interface LoginFormData {
  usuario: string;
  contraseña: string;
}

export interface RegisterFormData {
  nombre: string;
  correo: string;
  usuario: string;
  contraseña: string;
  confirmarContraseña: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}