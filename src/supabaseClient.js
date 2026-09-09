import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ymeyprolcjuwibrzdivf.supabase.co'
const supabaseKey = 'sb_publishable_m7s53Sy8qrbWR4vOs8OK2Q_58yZp8WU'

export const supabase = createClient(supabaseUrl, supabaseKey)