// DTO para las estadísticas (ResenaEstadisticasDTO)
export interface ResenaEstadisticasDTO {
    skuProducto: string;
    promedioCalificacion: number;
    totalResenas: number;
}

// Modelo de la Reseña (Resena)
export interface Resena {
    id: number;
    skuProducto: string;
    idUsuario: number;
    nombreUsuario: string;
    calificacion: number;
    comentario: string;
    fechaCreacion: string; // LocalDateTime llega como string ISO
}

// DTO para enviar una nueva reseña (ResenaBodyRequestDTO)
export interface ResenaRequestDTO {
    skuProducto: string;
    calificacion: number;
    comentario: string;
}