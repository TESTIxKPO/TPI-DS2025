// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { supabase } from './dbConfig.js'
import session from 'express-session'
import Keycloak from 'keycloak-connect'
import axios from 'axios'

const app = express()
const PORT = process.env.PORT 

const memoryStore = new session.MemoryStore()
app.use(session( {
  secret: 'Salmon/Secreto',
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
app.use(express.json())



// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ Servidor de Stock funcionando correctamente!')
})

// ============= RUTAS DE AUTENTICACIÓN =============


//NO AÑADIR LOS ENDPOINTS DE REGISTER Y LOGOUT


// Login de usuario
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    // URL con endpoint de keycloak
    const tokenUrl = 'http://localhost:8080/realms/ds-2025-realm/protocol/openid-connect/token'

    //Datos que se solicitan para el token
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
    const userInfo = req.kauth.grant.acces_token.content

    res.status(200).json({
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        nombreUsuario: userInfo.preferred_username,
        nombre: userInfo.give_name,
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

// EndPoint para listar productos (Protegido)
app.get('/productos', keycloak.protect(), async (req, res) => {
  const { data, error } = await supabase.from('productos').select('*')
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
})

// EndPoint para crear producto (Protegido)
app.post('/productos', keycloak.protect(), async (req, res) => {
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
app.put('/productos/:id', keycloak.protect(), async (req, res) => {
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
app.delete('/productos/:id', keycloak.protect(), async (req, res) => {
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
