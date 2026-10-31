import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"YUANCHUANG｜设计成长平台",description:"面向设计类学生的职业探索、知识学习与成长路径平台"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}