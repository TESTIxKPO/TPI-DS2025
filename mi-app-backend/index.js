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

// Middleware de autenticación
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar autenticación' })
  }
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ Servidor de Stock funcionando correctamente!')
})

// ============= RUTAS DE AUTENTICACIÓN =============

// Registro de usuario
app.post('/auth/registro', async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'No se pudo crear el usuario' })
    }
/*
    // Crear perfil en la tabla profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          role: role
        }
      ])
      .select()

    if (profileError) {
      console.error('Error al crear perfil:', profileError)
      return res.status(500).json({ 
        error: 'Usuario creado pero hubo un error al crear el perfil',
        details: profileError.message 
      })
    }
*/
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role
      },
      session: authData.session
    })

  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Login de usuario
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    // Autenticar con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Obtener el perfil del usuario
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Error al obtener perfil:', profileError)
    }

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profileData?.role || 'user'
      },
      session: data.session,
      access_token: data.session.access_token
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Cerrar sesión
app.post('/auth/logout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({ message: 'Sesión cerrada exitosamente' })
  } catch (error) {
    console.error('Error en logout:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener perfil del usuario autenticado
app.get('/auth/perfil', authenticateUser, async (req, res) => {
  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Perfil no encontrado' })
    }

    res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: profileData.role
      }
    })
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ============= RUTAS DE PRODUCTOS (Protegidas) =============

// EndPoint para listar productos (Protegido)
app.get('/productos', authenticateUser, async (req, res) => {
  const { data, error } = await supabase.from('productos').select('*')
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// EndPoint para crear producto (Protegido)
app.post('/productos', authenticateUser, async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body

    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre, descripcion, precio, stock }])
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data[0])
  } catch (error) {
    console.error('Error al crear producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// EndPoint para actualizar producto (Protegido)
app.put('/productos/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, stock } = req.body

    const { data, error } = await supabase
      .from('productos')
      .update({ nombre, descripcion, precio, stock })
      .eq('id', id)
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.status(200).json(data[0])
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// EndPoint para eliminar producto (Protegido)
app.delete('/productos/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})