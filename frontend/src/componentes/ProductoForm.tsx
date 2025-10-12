import { useState, ChangeEvent, FormEvent } from 'react';
import { agregarProducto } from '../servicios/api';

// Definimos el tipo del producto
interface Producto {
  nombre: string;
  descripcion: string;
  precio: string;
  cantidad: string;
}

// Definimos las props del componente
interface ProductoFormProps {
  onProductoAgregado: () => void;
}

export default function ProductoForm({ onProductoAgregado }: ProductoFormProps) {
  const [form, setForm] = useState<Producto>({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const resultado = await agregarProducto({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      cantidad: form.cantidad,
    });
    alert(resultado.mensaje || 'Producto agregado');
    setForm({ nombre: '', descripcion: '', precio: '', cantidad: '' });
    onProductoAgregado();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        required
      />
      <input
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Descripción"
      />
      <input
        name="precio"
        value={form.precio}
        onChange={handleChange}
        placeholder="Precio"
        type="number"
        required
      />
      <input
        name="cantidad"
        value={form.cantidad}
        onChange={handleChange}
        placeholder="Cantidad"
        type="number"
        required
      />
      <button type="submit">Agregar</button>
    </form>
  );
}
