import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://omgjbafqukpzdhhpdlaa.supabase.co";
const supabaseAnonKey = "sb_publishable_3bAOHbPjpV5RMnqb-cJKRA_cB1okqvT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
