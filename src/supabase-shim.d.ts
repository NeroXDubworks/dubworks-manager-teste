declare module "@supabase/supabase-js" {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;

  export const SupabaseClient: any;
}
