export interface ItemCarrito {
    idItemCarrito: number;
    sku: string;
    cantidad: number;
    montoTotal: number;
    nombreProducto: string;
    imagen: string;
    unidad: string;
    precioUnitarioActual: number;
}

export interface Carrito {
    idUsuario: number;
    subtotalGlobal: number;
    items: ItemCarrito[];
}