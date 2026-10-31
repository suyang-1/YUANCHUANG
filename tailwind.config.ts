import type {Config} from "tailwindcss";
const config:Config={
 content:["./src/**/*.{js,ts,jsx,tsx,mdx}"],
 theme:{extend:{
  colors:{
   brand:{50:"#F3F1FD",100:"#EAE4FF",500:"#8454F5",600:"#7343E4",700:"#5D35C2",secondary:"#FDB436",card:"#9C88EC"},
   ink:{900:"#091335",700:"#575363",500:"#A8A7AF",400:"#AAA5B5"}
  },
  boxShadow:{soft:"0 2px 12px rgba(35,20,70,.045)"},
  borderRadius:{xl2:"14px"}
 }},
 plugins:[]
};
export default config;