export interface LoginRequest {
  correo: string;
  clave: string;
}

export interface RegisterRequest {
  nombreCompleto: string;
  correo: string;
  clave: string;
}

export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  error?: string;
}

export interface UserPayload {
  sub: string;       
  rol: string;       
  idUsuario: number; 
  exp: number;       
}

export interface AuthContextType {
  user: UserPayload | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}