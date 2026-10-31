"use client";
import {useState} from "react";
import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";
import {Layers,Mail,LockKeyhole,ArrowRight,LoaderCircle} from "lucide-react";

export default function LoginPage(){
 const [mode,setMode]=useState<"login"|"signup">("login");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [name,setName]=useState("");
 const [accountType,setAccountType]=useState<"student"|"teacher">("student");
 const [major,setMajor]=useState("交互设计");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 async function submit(e:React.FormEvent){
  e.preventDefault();setError("");setMessage("");
  if(!configured){setError("尚未配置 Supabase。请先在部署环境中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。");return;}
  if(password.length<8){setError("密码至少需要 8 位。");return;}
  setBusy(true);
  try{
   const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
   if(mode==="signup"){
    const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name||email.split("@")[0],account_type:accountType,major:accountType==="student"?major:null},emailRedirectTo:window.location.origin+"/auth/callback"}});
    if(error)throw error;
    if(data.session)window.location.href="/";
    else setMessage("注册申请已提交。请检查邮箱并点击验证链接后登录。");
   }else{
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)throw error;
    window.location.href="/";
   }
  }catch(e){setError(e instanceof Error?e.message:"操作失败，请稍后重试。");}
  finally{setBusy(false);}
 }
 return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF9FC] px-4 py-10">
  <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-[#EDE5FF] blur-3xl"/><div className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-[#FFF0D4] blur-3xl"/>
  <section className="relative grid w-full max-w-4xl overflow-hidden rounded-xl border border-[#EEEAF4] bg-white shadow-[0_20px_70px_rgba(45,29,85,.08)] md:grid-cols-[.9fr_1.1fr]">
   <div className="hidden flex-col justify-between bg-gradient-to-br from-[#7044D7] via-[#8454F5] to-[#A58BF7] p-9 text-white md:flex"><div><div className="flex items-center gap-2 text-lg font-semibold"><Layers size={22}/> YUANCHUANG</div><p className="mt-2 text-xs text-white/70">设计成长平台</p></div><div><div className="text-3xl font-semibold leading-relaxed">让每一次学习<br/>都成为成长的坐标。</div><p className="mt-4 max-w-xs text-sm leading-7 text-white/75">探索职业方向，连接知识与实践，构建属于自己的设计成长路径。</p></div><div className="text-[10px] text-white/60">YUANCHUANG · DESIGN GROWTH PLATFORM</div></div>
   <div className="p-7 sm:p-10"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8454F5] md:hidden"><Layers size={18}/> YUANCHUANG</Link><div><h1 className="text-xl font-semibold text-[#091335]">{mode==="login"?"欢迎回来":"创建你的成长账号"}</h1><p className="mt-2 text-xs leading-5 text-[#A8A7AF]">{mode==="login"?"登录后继续管理你的学习计划与设计成长记录。":"加入设计成长社区，建立自己的能力档案。"}</p></div>
    <div className="mt-6 grid grid-cols-2 rounded-md bg-[#F7F5FA] p-1 text-xs"><button onClick={()=>{setMode("login");setError("");setMessage("");}} className={`rounded py-2 ${mode==="login"?"bg-white text-[#8454F5] shadow-sm":"text-slate-500"}`}>登录</button><button onClick={()=>{setMode("signup");setError("");setMessage("");}} className={`rounded py-2 ${mode==="signup"?"bg-white text-[#8454F5] shadow-sm":"text-slate-500"}`}>注册</button></div>
    <form onSubmit={submit} className="mt-5 space-y-4">{mode==="signup"&&<label className="block text-xs text-[#575363]">昵称<input value={name} onChange={e=>setName(e.target.value)} placeholder="你的称呼" className="mt-2 w-full rounded-md border border-[#EEEAF4] px-3 py-3 text-sm outline-none focus:border-[#8454F5]"/></label>}{mode==="signup"&&<><label className="block text-xs text-[#575363]">账号身份<select value={accountType} onChange={e=>setAccountType(e.target.value as "student"|"teacher")} className="mt-2 w-full rounded-md border border-[#EEEAF4] bg-white px-3 py-3 text-sm outline-none focus:border-[#8454F5]"><option value="student">学生</option><option value="teacher">教师</option></select></label>{accountType==="student"&&<label className="block text-xs text-[#575363]">所学专业<select value={major} onChange={e=>setMajor(e.target.value)} className="mt-2 w-full rounded-md border border-[#EEEAF4] bg-white px-3 py-3 text-sm outline-none focus:border-[#8454F5]">{["交互设计","视觉传达设计","产品设计","数字媒体艺术","工业设计","环境设计","动画","其他专业"].map(v=><option key={v}>{v}</option>)}</select></label>}</>}<label className="block text-xs text-[#575363]">邮箱<div className="mt-2 flex items-center gap-2 rounded-md border border-[#EEEAF4] px-3"><Mail size={15} className="text-[#A8A7AF]"/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" className="w-full py-3 text-sm outline-none"/></div></label><label className="block text-xs text-[#575363]">密码<div className="mt-2 flex items-center gap-2 rounded-md border border-[#EEEAF4] px-3"><LockKeyhole size={15} className="text-[#A8A7AF]"/><input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="至少 8 位密码" className="w-full py-3 text-sm outline-none"/></div></label>
    {error&&<p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-600">{error}</p>}{message&&<p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-700">{message}</p>}
    <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#8454F5] py-3 text-sm font-medium text-white hover:bg-[#7343E4] disabled:opacity-60">{busy?<LoaderCircle size={16} className="animate-spin"/>:null}{mode==="login"?"登录平台":"创建账号"}{!busy&&<ArrowRight size={15}/>}</button></form>
    <p className="mt-5 text-center text-[10px] leading-5 text-[#A8A7AF]">继续即表示你同意平台的服务条款与隐私政策。当前版本为开发阶段，正式开放前将补齐相关法律文本。</p>
   </div>
  </section>
 </main>
}
