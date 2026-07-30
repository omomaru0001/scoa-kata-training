import type { LearningModeId } from '../constants/learningModes';

export type SessionAnswer = { choiceIndex:number; answeredAt:string };
export type LearningSession = { version:2; id:string; categoryId:string; modeId:LearningModeId; questionIds:string[]; currentIndex:number; answersByQuestionId:Record<string, SessionAnswer>; startedAt:string; updatedAt:string };
const prefix = 'scoa-kata-training:session:';
const keyFor = (categoryId:string, modeId:LearningModeId) => `${prefix}${categoryId}:${modeId}`;

export const loadSession = (categoryId:string, modeId:LearningModeId):LearningSession | null => {
  try { const raw = localStorage.getItem(keyFor(categoryId, modeId)); if (!raw) return null; const value = JSON.parse(raw); return value?.version === 2 && value.categoryId === categoryId && value.modeId === modeId ? value : null; } catch { return null; }
};
export const saveSession = (session:LearningSession) => localStorage.setItem(keyFor(session.categoryId, session.modeId), JSON.stringify(session));
export const createSession = (categoryId:string, modeId:LearningModeId, questionIds:string[]):LearningSession => ({ version:2, id:`${categoryId}:${modeId}:${Date.now()}`, categoryId, modeId, questionIds, currentIndex:0, answersByQuestionId:{}, startedAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
/** 問題を最後まで回答したセットだけを「再挑戦」扱いにする。 */
export const isSessionComplete = (session:LearningSession) => session.questionIds.length > 0 && session.questionIds.every((id) => session.answersByQuestionId[id] !== undefined);
