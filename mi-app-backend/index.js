// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { supabase } from './dbConfig.js'

const app = express()
const PORT = process.env.PORT 

// Middleware
app.use(cors())
app.use(express.json())

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ Servidor de Stock funcionando correctamente!')
})

// EndPoint para listar productos
app.get('/productos', async (req, res) => {
  const { data, error } = await supabase.from('productos').select('*')
  
  
  if (error) {
    console.error('Error al obtener productos:', error.message)
    return res.status(500).json({ error: error.message })
  }
  res.json(data)
})

  // EndPoint para agregar un nuevo producto
app.post('/agregar-producto', async (req, res) => {
  const { nombre, descripcion, precio} = req.body

  // Validar que los campos obligatorios estén presentes
  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Faltan datos obligatorios (nombre o precio)' })
  }

  // Insertar el producto en la tabla "products"
  const { data: producto, error } = await supabase
    .from('productos')
    .insert([
      {
        nombre: nombre,
        descripcion: descripcion || '',
        precio: precio
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error al insertar producto:', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({
    mensaje: 'Producto agregado correctamente ✅',
    producto
  })
})




app.delete("/productos/:id_producto", async (req, res) => {
  const { id_producto } = req.params;

  const { data, error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id_producto);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  res.json({ message: "Producto eliminado correctamente." });
});

// Endpoint para editar (actualizar) un producto
app.put("/productos/:id_producto", async (req, res) => {
  const { id_producto } = req.params;
  const { nombre, cantidad, precio } = req.body;

  if (!nombre && !cantidad && !precio) {
    return res.status(400).json({ error: "Debes enviar al menos un campo para actualizar." });
  }

  const camposActualizados = {};
  if (nombre) camposActualizados.nombre = nombre;
  if (cantidad) camposActualizados.cantidad = cantidad;
  if (precio) camposActualizados.precio = precio;

  const { data, error } = await supabase
    .from("productos")
    .update(camposActualizados)
    .eq("id_producto", id_producto)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  res.json({ message: "Producto actualizado correctamente.", data });
});


// Crear una reserva de producto
app.post("/reservas", async (req, res) => {
  const { id_cliente, id_producto, cantidad } = req.body;

  if (!id_cliente || !id_producto || !cantidad) {
    return res.status(400).json({ error: "Faltan datos para realizar la reserva." });
  }

  //  Verificar si hay stock disponible
  const { data: producto, error: errorProducto } = await supabase
    .from("productos")
    .select("*")
    .eq("id_producto", id_producto)
    .single();

  if (errorProducto || !producto) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  if (producto.cantidad < cantidad) {
    return res.status(400).json({ error: "No hay suficiente stock disponible." });
  }

  //  Crear la reserva
  const { data: reserva, error: errorReserva } = await supabase
    .from("reservas")
    .insert([{ id_cliente, id_producto, cantidad }])
    .select();

  if (errorReserva) {
    return res.status(500).json({ error: errorReserva.message });
  }

  // Actualizar el stock del producto
  const nuevoStock = producto.cantidad - cantidad;
  await supabase
    .from("productos")
    .update({ cantidad: nuevoStock })
    .eq("id_producto", id_producto);

  res.status(201).json({
    message: "Reserva creada correctamente.",
    reserva,
    nuevoStock
  });

});

// Obtener todas las reservas
app.get("/reservas", async (req, res) => {
  const { data, error } = await supabase
    .from("reservas")
    .select(`
      id_reserva,
      cantidad,
      id_cliente,
      productos ( id_producto, nombre, precio ),
      created_at
    `)
    .order("id_reserva", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});


// Eliminar una reserva y devolver el stock al producto
app.delete("/reservas/:id_reserva", async (req, res) => {
  const { id_reserva } = req.params;

  // 1️⃣ Buscar la reserva
  const { data: reserva, error: errorReserva } = await supabase
    .from("reservas")
    .select("*")
    .eq("id_reserva", id_reserva)
    .single();

  if (errorReserva || !reserva) {
    return res.status(404).json({ error: "Reserva no encontrada." });
  }

  // 2️⃣ Eliminar la reserva
  const { error: errorDelete } = await supabase
    .from("reservas")
    .delete()
    .eq("id_reserva", id_reserva);

  if (errorDelete) {
    return res.status(500).json({ error: errorDelete.message });
  }

  // 3️⃣ Devolver el stock al producto
  const { data: producto, error: errorProducto } = await supabase
    .from("productos")
    .select("*")
    .eq("id_producto", reserva.id_producto)
    .single();

  if (!errorProducto && producto) {
    const nuevoStock = producto.cantidad + reserva.cantidad;
    await supabase
      .from("productos")
      .update({ cantidad: nuevoStock })
      .eq("id_producto", producto.id_producto);
  }

  res.json({ message: "Reserva eliminada correctamente y stock restaurado." });
});









// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})

