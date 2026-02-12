import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mpcfozvnmddgyobkfnsk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_qlB_iAuffoFcfrrM42M6og_fdvjMHiN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)