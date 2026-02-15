import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://htssbifatumhygeceobh.supabase.co";
const supabaseAnonKey = "sb_publishable_oL6WUsHG1CS-hzsZRyx1Bg_fhD2t2Ik";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
