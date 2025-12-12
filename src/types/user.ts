// DTO de respuesta (Lo que recibes del GET)
export interface UsuarioProfileDTO {
    nombreCompleto: string;
    biografia: string;
    direccionEntrega: string;
}

// DTO de solicitud (Lo que envías en el PUT)
export interface UpdateProfileRequestDTO {
    nombreCompleto: string;
    biografia: string;
    direccionEntrega: string;
}

export interface ChangePasswordRequestDTO {
    claveActual: string;
    nuevaClave: string;
    confirmacionNuevaClave: string; // <-- Nuevo campo
}