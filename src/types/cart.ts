export interface ItemCarrito {
    idItemCarrito: number;
    sku: string;
    cantidad: number;
    montoTotal: number;
    nombreProducto: string;
    urlImagen: string;
    unidadMedida: string;
    precioUnitarioActual: number;
}

export interface Carrito {
    idUsuario: number;
    subtotalGlobal: number;
    items: ItemCarrito[];
}