// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { supabase } from './dbConfig.js' // Asumo que tienes este archivo para la config de Supabase
import session from 'express-session'
import Keycloak from 'keycloak-connect'
import axios from 'axios'

const app = express()
const PORT = process.env.PORT 

const memoryStore = new session.MemoryStore()
app.use(session( {
  secret: 'Salmon/Secreto', // Deberías cambiar esto por una variable de entorno
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}))

const keycloak = new Keycloak({store: memoryStore})
app.use(keycloak.middleware({
  logout:'/auth/logout'
}))


// Middleware
app.use(cors())
app.use(express.json());



// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ Servidor de Stock funcionando correctamente!')
})

// ============= RUTAS DE AUTENTICACIÓN =============

// Login de usuario
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    const tokenUrl = 'http://localhost:8080/realms/ds-2025-realm/protocol/openid-connect/token'
    const params = new URLSearchParams()
    params.append('client_id', 'grupo-02')
    params.append('grant_type', 'password')
    params.append('username', email)
    params.append('password', password)
    params.append('scope', 'openid')

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    res.status(200).json({
      message:'Login exitoso',
      ...response.data
    })

  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message)
    if (error.response && error.response.status === 401){
      return res.status(401).json({error:'Credenciales invalidas'})
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener perfil del usuario autenticado
app.get('/auth/perfil', keycloak.protect(), async (req, res) => {
  try {
    // Corregido: 'access_token' en lugar de 'acces_token'
    const userInfo = req.kauth.grant.access_token.content 

    res.status(200).json({
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        nombreUsuario: userInfo.preferred_username,
        nombre: userInfo.given_name, // Corregido: 'given_name'
        apellido: userInfo.family_name,
        roles: userInfo.realm_access?.roles || []
      }
    })

  } catch (error) {
    console.error('Error al obtener perfil:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ============= RUTAS DE PRODUCTOS (Protegidas) =============

// EndPoint para listar productos
app.get('/productos', keycloak.protect(), async (req, res) => {
  const { data, error } = await supabase.from('productos').select('*')
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// EndPoint para crear producto
app.post('/productos', keycloak.protect(), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body

    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre, descripcion, precio, stock }])
      .select()
      .single() // Devuelve el objeto creado, no un array

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// EndPoint para actualizar producto
app.put('/productos/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, stock } = req.body

    // Validar que al menos venga un campo para actualizar
    const camposParaActualizar = {};
    if (nombre !== undefined) camposParaActualizar.nombre = nombre;
    if (descripcion !== undefined) camposParaActualizar.descripcion = descripcion;
    if (precio !== undefined) camposParaActualizar.precio = precio;
    if (stock !== undefined) camposParaActualizar.stock = stock;
    
    if (Object.keys(camposParaActualizar).length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' });
    }

    const { data, error } = await supabase
      .from('productos')
      .update(camposParaActualizar)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// EndPoint para eliminar producto
app.delete('/productos/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .select() // Para verificar si se borró algo
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})


// ============= RUTAS DE RESERVAS (Protegidas) =============
// Estas son las rutas clave para Logística

// Listar reservas (con filtros del openapi)
app.get('/reservas', keycloak.protect(), async (req, res) => {
  try {
    const { usuarioId, estado } = req.query
    
    // El spec dice que usuarioId es requerido
    if (!usuarioId) {
        return res.status(400).json({ code: "INVALID_DATA", message: "El campo 'usuarioId' es requerido." });
    }

    let query = supabase
      .from('reservas')
      .select('*')
      .eq('usuarioId', usuarioId) // Filtro requerido

    if (estado) {
      query = query.eq('estado', estado) // Filtro opcional
    }

    const { data, error } = await query

    if (error) throw error;
    res.status(200).json(data)

  } catch (error) {
    console.error('Error al listar reservas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Crear una reserva
app.post('/reservas', keycloak.protect(), async (req, res) => {
  try {
    // Campos según el schema ReservaInput
    const { idCompra, usuarioId, productos } = req.body

    if (!idCompra || !usuarioId || !productos) {
      return res.status(400).json({ code: "INVALID_DATA", message: "Faltan campos requeridos." });
    }
    
    // Aquí iría la lógica de transacción para verificar stock y crear la reserva.
    // Por simplicidad, solo insertamos la reserva:
    const { data, error } = await supabase
      .from('reservas')
      .insert([{ 
        idCompra, 
        usuarioId, 
        productos, 
        estado: 'confirmado' // Estado por defecto
      }])
      .select()
      .single()

    if (error) throw error;
    res.status(201).json(data)

  } catch (error) {
    console.error('Error al crear reserva:', error)
    // Manejar errores de stock insuficiente (400) o conflictos (409)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Consultar una reserva por ID
app.get('/reservas/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query; // El spec dice que es requerido

    if (!usuarioId) {
        return res.status(400).json({ code: "INVALID_DATA", message: "El campo 'usuarioId' es requerido." });
    }
    
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', id)
      .eq('usuarioId', usuarioId) // Asegura que solo el usuario vea su reserva
      .single()
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reserva no encontrada' });

    res.status(200).json(data)

  } catch (error) {
    console.error('Error al obtener reserva:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Actualizar estado de una reserva (Ej. Logística notifica "enviado")
app.patch('/reservas/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, estado } = req.body; // Según schema ActualizarReservaInput

    if (!usuarioId || !estado) {
      return res.status(400).json({ code: "INVALID_DATA", message: "Faltan campos 'usuarioId' o 'estado'." });
    }

    const { data, error } = await supabase
      .from('reservas')
      .update({ estado })
      .eq('id', id)
      .eq('usuarioId', usuarioId) // Verificación de propiedad
      .select()
      .single()

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reserva no encontrada' });
    
    res.status(200).json(data)

  } catch (error) {
    console.error('Error al actualizar reserva:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Cancelar una reserva
app.delete('/reservas/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params;
    // El spec pide un body con 'motivo', pero el delete de Supabase es simple.
    // Asumimos que la lógica de negocio (devolver stock) se maneja aquí o en un trigger.

    const { data, error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reserva no encontrada' });
    
    // El spec pide 204 No Content para un DELETE exitoso
    res.status(204).send()

  } catch (error) {
    console.error('Error al cancelar reserva:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})


// ============= RUTAS DE CATEGORÍAS (Protegidas) =============

// Listar todas las categorías
app.get('/categorias', keycloak.protect(), async (req, res) => {
  try {
    const { data, error } = await supabase.from('categorias').select('*')
    if (error) throw error;
    res.status(200).json(data)
  } catch (error) {
    console.error('Error al listar categorías:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Crear una nueva categoría
app.post('/categorias', keycloak.protect(), async (req, res) => {
  try {
    const { nombre, descripcion } = req.body
    if (!nombre) return res.status(400).json({ error: 'El campo "nombre" es requerido' })
    
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre, descripcion }])
      .select()
      .single()

    if (error) throw error;
    res.status(201).json(data)

  } catch (error) {
    console.error('Error al crear categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener una categoría por ID
app.get('/categorias/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' })

    res.status(200).json(data)

  } catch (error) {
    console.error('Error al obtener categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Actualizar una categoría
app.patch('/categorias/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion } = req.body

    const camposActualizados = {}
    if (nombre) camposActualizados.nombre = nombre;
    if (descripcion) camposActualizados.descripcion = descripcion;
    
    if (Object.keys(camposActualizados).length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' });
    }

    const { data, error } = await supabase
      .from('categorias')
      .update(camposActualizados)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' })
    
    res.status(200).json(data)

  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Eliminar una categoría
app.delete('/categorias/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' })

    res.status(204).send()

  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})