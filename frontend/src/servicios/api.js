//const API_URL = 'http://localhost:4000';
/* Servicio para interactuar con la API del backend 
export async function obtenerProductos() {
  const res = await fetch(`${API_URL}/productos`);
  return await res.json();
}*/

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API_URL:', API_URL);
import keycloak from '../lib/keycloak'; // tu instancia de keycloak

/*
export async function obtenerProductos() {
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
} */

export async function agregarProducto(producto) {
  const res = await fetch(`${API_URL}/agregar-producto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });
  return await res.json();
}

export async function obtenerProductos() {  //Esto hace que el backend reciba el token, lo valide con Keycloak y te devuelva los datos.
  const token = keycloak.token;
  const res = await fetch(`${API_URL}/productos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
}
