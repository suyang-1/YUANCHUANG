"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";

type Work={id:string;owner_id:string;title:string;description:string|null;cover_url:string|null;tags:string[]|null;created_at:string;author_name:string};

function storageObjectPath(value:string){
 try{
  const pathname=new URL(value).pathname;
  const marker="/storage/v1/object/";
  const index=pathname.indexOf(marker);
  if(index<0)return null;
  return decodeURIComponent(pathname.slice(index+marker.length).replace(/^(public|sign)\/portfolio\//,""));
 }catch{return null;}
}

export default function GalleryPage(){
 const [works,setWorks]=useState<Work[]>([]);
 const [loading,setLoading]=useState(true);
 const [search,setSearch]=useState("");
 const [tag,setTag]=useState("全部");
 const [error,setError]=useState("");
 useEffect(()=>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key){setError("连接 Supabase 并执行迁移后，公开作品展厅即可展示真实作品。");setLoading(false);return;}
  let active=true;
  const db=createBrowserClient(url,key);
  (async()=>{
   const {data,error:queryError}=await db.from("portfolio_items").select("id,owner_id,title,description,cover_url,tags,created_at").eq("is_public",true).order("created_at",{ascending:false}).limit(100);
   if(!active)return;
   if(queryError){setError("作品读取失败："+queryError.message);setLoading(false);return;}
   const rows=data??[];
   const ownerIds=[...new Set(rows.map((x:any)=>x.owner_id).filter(Boolean))];
   const {data:profiles}=ownerIds.length?await db.from("profiles").select("id,display_name,is_public").in("id",ownerIds):{data:[]};
   const profileMap=new Map((profiles??[]).map((p:any)=>[p.id,p]));
   const result=await Promise.all(rows.map(async(row:any)=>{
    let cover=row.cover_url as string|null;
    const path=cover?storageObjectPath(cover):null;
    if(path){
     const {data:signed}=await db.storage.from("portfolio").createSignedUrl(path,3600);
     cover=signed?.signedUrl??null;
    }else cover=null;
    const author:any=profileMap.get(row.owner_id);
    return {...row,cover_url:cover,author_name:author?.is_public?author.display_name:"创作者"} as Work;
   }));
   if(active)setWorks(result);
   setLoading(false);
  })();
  return()=>{active=false;};
 },[]);
 const tags=useMemo(()=>["全部",...Array.from(new Set(works.flatMap(x=>x.tags??[]))).sort()], [works]);
 const filtered=useMemo(()=>works.filter(x=>{
  const matchesTag=tag==="全部"||(x.tags??[]).includes(tag);
  const q=search.trim().toLowerCase();
  const matchesSearch=!q||[x.title,x.description??"",x.author_name,...(x.tags??[])].join(" ").toLowerCase().includes(q);
  return matchesTag&&matchesSearch;
 }),[works,tag,search]);
 return <main className="min-h-screen bg-[#faf9fc] px-4 py-8 text-slate-800 sm:px-6">
  <div className="mx-auto max-w-6xl">
   <header className="mb-8 flex flex-wrap items-center justify-between gap-3"><div><Link href="/" className="text-sm font-semibold tracking-wide text-[#8454F5]">YUANCHUANG</Link><h1 className="mt-3 text-2xl font-semibold">作品展厅</h1><p className="mt-2 text-sm text-slate-500">发现设计学习者主动公开的作品与创作过程</p></div><Link href="/" className="rounded-lg border border-[#e8e1f4] bg-white px-4 py-2 text-xs text-slate-600">返回工作台</Link></header>
   <section className="mb-6 rounded-xl border border-[#eeeaf4] bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索作品名称、描述、作者或标签…" className="min-w-0 flex-1 rounded-lg border border-[#e9e5ef] px-3 py-2.5 text-sm outline-none focus:border-[#8454F5]"/><span className="self-center text-xs text-slate-400">{filtered.length} 件作品</span></div><div className="mt-3 flex flex-wrap gap-2">{tags.map(x=><button key={x} onClick={()=>setTag(x)} className={tag===x?"rounded-full bg-[#8454F5] px-3 py-1.5 text-[11px] text-white":"rounded-full bg-[#f5f3f8] px-3 py-1.5 text-[11px] text-slate-500 hover:bg-[#eee9fb]"}>{x}</button>)}</div></section>
   {loading?<div className="rounded-xl border bg-white p-12 text-center text-sm text-slate-400">正在加载公开作品…</div>:error?<div className="rounded-xl border border-dashed bg-white p-12 text-center text-sm text-slate-500">{error}</div>:filtered.length===0?<div className="rounded-xl border border-dashed bg-white p-12 text-center"><p className="text-sm text-slate-500">{works.length?"没有找到匹配的作品":"还没有公开作品"}</p><p className="mt-2 text-xs text-slate-400">你可以在个人主页的作品管理中选择公开作品。</p></div>:<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(work=><article key={work.id} className="overflow-hidden rounded-xl border border-[#eeeaf4] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex h-52 items-center justify-center bg-gradient-to-br from-[#eee9ff] to-[#dbeafe]">{work.cover_url?<img src={work.cover_url} alt={work.title} className="h-full w-full object-cover"/>:<span className="text-5xl text-[#8454F5]">✳</span>}</div><div className="p-4"><div className="flex items-center justify-between gap-2"><span className="text-[11px] text-[#8454F5]">{work.author_name}</span><time className="text-[10px] text-slate-400">{new Date(work.created_at).toLocaleDateString("zh-CN")}</time></div><h2 className="mt-2 text-sm font-semibold">{work.title}</h2>{work.description&&<p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{work.description}</p>}{work.tags&&work.tags.length>0&&<div className="mt-3 flex flex-wrap gap-1.5">{work.tags.map(x=><button key={x} onClick={()=>setTag(x)} className="rounded bg-[#f3effc] px-2 py-1 text-[10px] text-[#7452bc]">{x}</button>)}</div>}<Link href={`/u/${work.owner_id}`} className="mt-4 inline-flex text-xs font-medium text-[#8454F5] hover:underline">查看作者公开主页 →</Link></div></article>)}</div>}
   <footer className="mt-12 pb-6 text-center text-[11px] text-slate-400">仅展示作者主动公开的作品 · YUANCHUANG</footer>
  </div>
 </main>;
}
