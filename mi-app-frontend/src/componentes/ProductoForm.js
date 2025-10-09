import { useState } from 'react';
import { agregarProducto } from '../servicios/api';

export default function ProductoForm({ onProductoAgregado }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '',cantidad:'' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const resultado = await agregarProducto({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      cantidad: form.cantidad
    });
    alert(resultado.mensaje || 'Producto agregado');
    setForm({ nombre: '', descripcion: '', precio: '' ,cantidad:''});
    onProductoAgregado();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
      <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" />
      <input name="precio" value={form.precio} onChange={handleChange} placeholder="Precio" type="number" required />
      <input name="cantidad" value={form.cantidad} onChange={handleChange} placeholder="Cantidad" type="number" required />
      <button type="submit">Agregar</button>
    </form>
  );
}
