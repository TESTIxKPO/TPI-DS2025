import { useEffect, useState } from 'react';
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
}
