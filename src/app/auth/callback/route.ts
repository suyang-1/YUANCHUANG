import {NextResponse} from "next/server";
import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";

export async function GET(request:Request){
 const {searchParams,origin}=new URL(request.url);
 const code=searchParams.get("code");
 if(code){
  const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!supabaseUrl||!supabaseKey)return NextResponse.redirect(new URL("/login?error=supabase_not_configured",origin));
  const cookieStore=cookies();
  const supabase=createServerClient(supabaseUrl,supabaseKey,{cookies:{getAll(){return cookieStore.getAll();},setAll(cookiesToSet:Array<{name:string;value:string;options?:Record<string,unknown>}>){try{cookiesToSet.forEach(({name,value,options})=>cookieStore.set(name,value,options));}catch{}}}});
  const {error}=await supabase.auth.exchangeCodeForSession(code);
  if(!error)return NextResponse.redirect(new URL("/",origin));
 }
 return NextResponse.redirect(new URL("/login?error=auth_callback",origin));
}
