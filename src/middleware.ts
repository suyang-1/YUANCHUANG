import {NextResponse,type NextRequest} from "next/server";
import {createServerClient} from "@supabase/ssr";

export async function middleware(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 // Keep local preview usable until the owner configures Supabase credentials.
 if(!url||!key)return NextResponse.next({request});
 let response=NextResponse.next({request});
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll();},setAll(cookiesToSet:Array<{name:string;value:string;options?:Record<string,unknown>}>){cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 const {data:{user}}=await supabase.auth.getUser();
 const isLogin=request.nextUrl.pathname.startsWith("/login");
 if(!user&&!isLogin){const target=request.nextUrl.clone();target.pathname="/login";target.searchParams.set("next",request.nextUrl.pathname);return NextResponse.redirect(target);}
 if(user&&isLogin){const target=request.nextUrl.clone();target.pathname="/";target.search="";return NextResponse.redirect(target);}
 return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]};
