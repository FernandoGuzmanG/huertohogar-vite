export interface DetallePedidoResponse {
    id: number;
    skuProducto: string;      // En el JSON viene como skuProducto
    nombreProducto: string;   // En el JSON viene como nombreProducto
    precioUnitario: number;
    cantidad: number;
    subtotal: number;
}

export interface PedidoResponse {
    id: number;
    usuarioId: number;
    fechaCreacion: string;
    estado: string;
    total: number;
    direccionEnvio: string;
    items: DetallePedidoResponse[];
}