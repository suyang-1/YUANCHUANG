import type {Config} from "tailwindcss";
const config:Config={content:["./src/**/*.{js,ts,jsx,tsx,mdx}"],theme:{extend:{colors:{brand:{50:"#f6efff",100:"#eadbff",500:"#8738f5",600:"#7425df",700:"#5f1eb8"}},boxShadow:{soft:"0 2px 12px rgba(31,20,56,.045)"},borderRadius:{xl2:"14px"}}},plugins:[]};
export default config;