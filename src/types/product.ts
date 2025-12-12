// Mapeo exacto del ProductoDTO de Java
export interface Producto {
    id: string; // Este suele ser el SKU
    nombre: string;
    precio: number;
    stock: number;
    descripcion: string;
    categoria: string;       // ID de la categoría (ej: "1")
    categoriaNombre: string; // Nombre legible (ej: "Frutas")
    unidad: string;          // Ej: "kg", "unidad", "malla"
    origen: string;          // Ej: "Valle del Maule"
    imagen: string;          // URL de la imagen
}