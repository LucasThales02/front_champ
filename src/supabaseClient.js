import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpwzmoxxzjhnzfuvmavt.supabase.co';
const supabaseKey = 'sb_publishable_U1NlBKwV4tyHntAacBSWyQ_jahOyeRK';

export const supabase = createClient(supabaseUrl, supabaseKey);
