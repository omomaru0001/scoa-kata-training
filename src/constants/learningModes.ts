import type { Question } from '../types';

export type LearningModeId = 'memorize' | 'blank' | 'identify' | 'substitute' | 'practice' | 'weak' | 'random';
export type LearningModeDefinition = { id:LearningModeId; icon:string; title:string; description:string; maxQuestions?:number; shuffle?:boolean; filter:(question:Question)=>boolean };

const sequenceMemorize = new Set(['constant-difference','constant-ratio']);
const sequenceSubstitute = new Set(['growing-difference','changing-multiplier','difference-pattern','alternating']);
const saltIn = (q:Question, mode:LearningModeId) => q.categoryId === 'saltwater-alligation' && q.saltwater?.modeIds?.includes(mode as 'memorize'|'blank'|'identify'|'substitute'|'practice') === true;

export const learningModes:LearningModeDefinition[] = [
  { id:'memorize', icon:'🌱', title:'まず覚える', description:'基本ルールを1つずつ確認', filter:(q) => q.categoryId === 'saltwater-alligation' ? saltIn(q,'memorize') : q.categoryId === 'sequence-patterns' ? sequenceMemorize.has(String(q.typeId)) : ['forward','reverse'].includes(q.learningStage) },
  { id:'blank', icon:'🧩', title:'穴埋め', description:'手順の一部を埋める', filter:(q) => q.categoryId === 'saltwater-alligation' ? saltIn(q,'blank') : q.learningStage === 'blank' },
  { id:'identify', icon:'🔎', title:'型を見分ける', description:'どの解き方を使うか選ぶ', filter:(q) => q.categoryId === 'saltwater-alligation' ? saltIn(q,'identify') : q.categoryId === 'sequence-patterns' ? q.typeId === 'sequence-identify' : q.learningStage === 'identify' },
  { id:'substitute', icon:'✏️', title:'数字を当てはめる', description:'型に数字を入れて練習', filter:(q) => q.categoryId === 'saltwater-alligation' ? saltIn(q,'substitute') : q.categoryId === 'sequence-patterns' ? sequenceSubstitute.has(String(q.typeId)) : q.learningStage === 'substitute' },
  { id:'practice', icon:'📝', title:'実戦問題', description:'問題文から最後まで解く', filter:(q) => q.categoryId === 'saltwater-alligation' ? saltIn(q,'practice') : q.categoryId === 'sequence-patterns' ? !sequenceMemorize.has(String(q.typeId)) && !sequenceSubstitute.has(String(q.typeId)) && q.typeId !== 'sequence-identify' : true },
  { id:'weak', icon:'🔁', title:'苦手だけ復習', description:'まちがえた問題だけ確認', filter:() => false },
  { id:'random', icon:'🎲', title:'ランダム確認', description:'このカテゴリの型をまぜる', maxQuestions:10, shuffle:true, filter:() => true },
];

export const modeById = (id:LearningModeId) => learningModes.find((mode) => mode.id === id)!;
