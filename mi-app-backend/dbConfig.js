// dbConfig.js
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Lee las variables desde el archivo .env
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

// Crea el cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)