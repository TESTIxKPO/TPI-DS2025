const API_URL = 'http://localhost:3000';

export async function obtenerProductos() {
  const res = await fetch(`${API_URL}/productos`);
  return await res.json();
}

export async function agregarProducto(producto) {
  const res = await fetch(`${API_URL}/agregar-producto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });
  return await res.json();
}
