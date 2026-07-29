export type History = {answers:Record<string,{attempts:number;correct:number;wrong:number;streak:number;lastAt:string;avgSeconds:number}>; wrongIds:string[]; total:number; today:string; todayTotal:number; cheer:{firstShown:boolean; remaining:number; recent:string[]; lastAnswerTotal:number}};
const key='scoa-kata-history-v1'; const day=()=>new Date().toISOString().slice(0,10);
export const loadHistory=():History=>{try{const raw=localStorage.getItem(key);if(raw)return JSON.parse(raw)}catch{} return {answers:{},wrongIds:[],total:0,today:day(),todayTotal:0,cheer:{firstShown:false,remaining:7+Math.floor(Math.random()*3),recent:[],lastAnswerTotal:0}}};
export const saveHistory=(value:History)=>localStorage.setItem(key,JSON.stringify(value));
export const resetHistory=()=>localStorage.removeItem(key);
