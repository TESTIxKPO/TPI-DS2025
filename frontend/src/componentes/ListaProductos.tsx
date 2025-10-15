import React, { useEffect, useState } from 'react';
import { obtenerProductos } from '../servicios/api'; // si cambias api a .ts, mantener import

export interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad?: number | null;
}

interface Props {
  actualizar?: boolean;
}

export default function ListaProductos({ actualizar }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    obtenerProductos().then((res: Producto[]) => setProductos(res));
  }, [actualizar]);

  return (
    <div>
      <h2>Productos disponibles</h2>
      {productos.map(p => (
        <div key={p.id_producto}>
          <strong>{p.nombre}</strong><br />
          Precio: ${p.precio}<br />
          Cantidad: {p.cantidad ?? 'N/A'}
        </div>
      ))}
    </div>
  );
}



/* import { useEffect, useState } from 'react';
import { obtenerProductos } from '../servicios/api';

export default function ListaProductos({ actualizar }) {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    obtenerProductos().then(setProductos);
  }, [actualizar]);

  return (
    <div>
      <h2>Productos disponibles</h2>
      {productos.map(p => (
        <div key={p.id_producto}>
          <strong>{p.nombre}</strong><br />
          Precio: ${p.precio}<br />
          Cantidad: {p.cantidad ?? 'N/A'}
        </div>
      ))}
    </div>
  );
} */
