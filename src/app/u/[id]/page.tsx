"use client";

import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {createBrowserClient} from "@supabase/ssr";

type PublicProfile={display_name:string;account_type:"student"|"teacher";major:string|null;school:string|null;grade:string|null;career_goal:string|null;bio:string|null;};
type PortfolioItem={id:string;title:string;description:string|null;cover_url:string|null;tags:string[]|null;created_at:string};

export default function PublicProfilePage(){
 const params=useParams<{id:string}>();
 const [profile,setProfile]=useState<PublicProfile|null>(null);
 const [items,setItems]=useState<PortfolioItem[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key){setError("主页暂不可访问，平台尚未连接 Supabase。");setLoading(false);return;}
  let active=true;
  const supabase=createBrowserClient(url,key);
  (async()=>{
   const {data:profileData,error:profileError}=await supabase.from("profiles").select("display_name,account_type,major,school,grade,career_goal,bio,is_public").eq("id",params.id).eq("is_public",true).maybeSingle();
   if(!active)return;
   if(profileError||!profileData){setError("该主页不存在，或用户尚未公开个人主页。");setLoading(false);return;}
   setProfile(profileData as PublicProfile);
   const {data:portfolioData}=await supabase.from("portfolio_items").select("id,title,description,cover_url,tags,created_at").eq("owner_id",params.id).eq("is_public",true).order("created_at",{ascending:false});
   if(!active)return;
   const visibleItems=(portfolioData??[]) as PortfolioItem[];
   const itemsWithSignedCovers=await Promise.all(visibleItems.map(async item=>{
    if(!item.cover_url)return item;
    try{
     const pathname=new URL(item.cover_url).pathname;
     const marker="/storage/v1/object/";
     const markerIndex=pathname.indexOf(marker);
     if(markerIndex<0)return item;
     const objectPath=decodeURIComponent(pathname.slice(markerIndex+marker.length).replace(/^public\\//,"").replace(/^sign\\//,""));
     const {data:signedData,error:signedError}=await supabase.storage.from("portfolio").createSignedUrl(objectPath,3600);
     if(signedError||!signedData?.signedUrl)return {...item,cover_url:null};
     return {...item,cover_url:signedData.signedUrl};
    }catch{return {...item,cover_url:null};}
   }));
   setItems(itemsWithSignedCovers);
   setLoading(false);
  })();
  return()=>{active=false;};
 },[params.id]);
 if(loading)return <main className="grid min-h-screen place-items-center bg-[#faf9fc] text-sm text-slate-400">正在加载个人主页…</main>;
 if(error||!profile)return <main className="grid min-h-screen place-items-center bg-[#faf9fc] p-6"><div className="max-w-sm rounded-xl border bg-white p-8 text-center shadow-sm"><div className="text-lg font-semibold text-slate-800">暂时无法查看</div><p className="mt-3 text-sm leading-6 text-slate-500">{error}</p><a href="/" className="mt-5 inline-flex rounded-lg bg-[#8454F5] px-4 py-2 text-sm text-white">返回平台首页</a></div></main>;
 const identity=profile.account_type==="teacher"?"教师":"学生";
 const details=[profile.major&&profile.account_type==="student"?profile.major:null,profile.grade,profile.school,profile.career_goal].filter(Boolean).join(" · ");
 return <main className="min-h-screen bg-[#faf9fc] px-4 py-10 text-slate-800"><div className="mx-auto max-w-5xl">
  <header className="mb-6 flex items-center justify-between"><a href="/" className="text-sm font-semibold tracking-wide text-[#8454F5]">YUANCHUANG · 设计成长平台</a><span className="rounded-full bg-[#f0eaff] px-3 py-1 text-xs text-[#8454F5]">公开主页</span></header>
  <section className="rounded-2xl border border-[#eeeaf4] bg-white p-6 shadow-sm sm:p-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-300 via-[#8454F5] to-indigo-700 text-3xl text-white">{profile.display_name.slice(0,1)||"用"}</div><div><h1 className="text-2xl font-semibold">{profile.display_name}</h1><p className="mt-2 text-sm text-slate-500">{identity}</p><p className="mt-1 text-sm text-slate-400">{details}</p></div></div>{profile.bio&&<p className="mt-7 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600">{profile.bio}</p>}</section>
  <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-semibold">公开作品</h2><p className="mt-1 text-xs text-slate-400">仅展示作者主动公开的作品</p></div><span className="text-xs text-slate-400">{items.length} 件作品</span></div>
   {items.length===0?<div className="rounded-xl border border-dashed bg-white p-12 text-center text-sm text-slate-400">暂未公开作品</div>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(item=><article key={item.id} className="overflow-hidden rounded-xl border border-[#eeeaf4] bg-white shadow-sm"><div className="flex h-48 items-center justify-center bg-gradient-to-br from-[#eee9ff] to-[#dbeafe]">{item.cover_url?<img src={item.cover_url} alt={item.title} className="h-full w-full object-cover"/>:<span className="text-4xl text-[#8454F5]">✳</span>}</div><div className="p-4"><h3 className="text-sm font-semibold">{item.title}</h3>{item.description&&<p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{item.description}</p>}{item.tags&&item.tags.length>0&&<div className="mt-3 flex flex-wrap gap-1">{item.tags.map(tag=><span key={tag} className="rounded bg-[#f3effc] px-2 py-1 text-[10px] text-[#7452bc]">{tag}</span>)}</div>}</div></article>)}</div>}
  </section><footer className="mt-12 text-center text-[11px] text-slate-400">YUANCHUANG · 让设计学习与成长被看见</footer>
 </div></main>;
}
