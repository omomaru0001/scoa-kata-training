import { useEffect, useMemo, useState } from 'react';
import questionsJson from './data/questions.json';
import { saltwaterQuestions } from './data/saltwaterQuestions';
import { sequenceQuestions } from './data/sequenceQuestions';
import { learningModes, modeById, type LearningModeId } from './constants/learningModes';
import { createSession, loadSession, saveSession, type LearningSession } from './lib/sessions';
import { loadHistory, saveHistory, type History } from './lib/storage';
import { BackMenu, type QuizBackActions } from './components/BackMenu';
import { Diagram } from './components/Diagram';
import { SaltwaterAnswerExplanation } from './components/SaltwaterAnswerExplanation';
import type { Question } from './types';

const questions = [...(questionsJson as Question[]), ...saltwaterQuestions, ...sequenceQuestions];
type CategoryId = 'factorization'|'saltwater-alligation'|'sequence-patterns';
type Screen = 'home'|'categories'|'modes'|'session'|'quiz';
const titleFor:Record<CategoryId,string> = { factorization:'因数分解・公式暗記', 'saltwater-alligation':'食塩水・濃度｜天秤算', 'sequence-patterns':'数列｜規則の見つけ方' };

const shuffled = <T,>(items:T[]) => [...items].sort(() => Math.random() - .5);
const categoryQuestions = (categoryId:CategoryId) => questions.filter((question) => question.categoryId === categoryId);
const answersFor = (session:LearningSession) => Object.fromEntries(session.questionIds.map((id, index) => [index, session.answersByQuestionId[id]?.choiceIndex]).filter(([, value]) => value !== undefined)) as Record<number,number>;

export function AppNew() {
  const [screen, setScreen] = useState<Screen>('home');
  const [categoryId, setCategoryId] = useState<CategoryId>('factorization');
  const [modeId, setModeId] = useState<LearningModeId>('memorize');
  const [session, setSession] = useState<LearningSession|null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number,number>>({});
  const [history, setHistory] = useState<History>(loadHistory);
  const [showCheer, setShowCheer] = useState(false);
  const activeQuestions = useMemo(() => session ? session.questionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean) as Question[] : [], [session]);
  const question = activeQuestions[index];
  const selected = answers[index] ?? null;
  const answered = selected !== null;
  const correct = question ? selected === question.answerIndex : false;
  const persistHistory = (next:History) => { setHistory(next); saveHistory(next); };
  const go = (next:Screen, state?:Partial<{categoryId:CategoryId;modeId:LearningModeId;index:number;sessionId:string}>) => {
    setScreen(next);
    window.history.pushState({ screen:next, categoryId, modeId, index, sessionId:session?.id, ...state }, '');
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  useEffect(() => {
    window.history.replaceState({ screen:'home' }, '');
    const restore = (event:PopStateEvent) => {
      const state = event.state;
      if (!state?.modeId || !state?.categoryId) { setSession(null); setScreen(state?.screen === 'home' ? 'home' : 'modes'); return; }
      const restored = loadSession(state.categoryId, state.modeId);
      if (!restored || (state.sessionId && restored.id !== state.sessionId)) { setSession(null); setCategoryId(state.categoryId); setModeId(state.modeId); setScreen('modes'); return; }
      setCategoryId(state.categoryId); setModeId(state.modeId); setSession(restored); setIndex(Math.min(state.index ?? restored.currentIndex, restored.questionIds.length - 1)); setAnswers(answersFor(restored)); setScreen(state.screen === 'quiz' ? 'quiz' : 'modes');
    };
    window.addEventListener('popstate', restore); return () => window.removeEventListener('popstate', restore);
  }, []);

  const candidates = (category:CategoryId, mode:LearningModeId) => {
    const source = categoryQuestions(category);
    if (mode === 'weak') return source.filter((q) => history.wrongIds.includes(q.id));
    return source.filter(modeById(mode).filter);
  };
  const startMode = (nextMode:LearningModeId) => {
    const definition = modeById(nextMode); const source = candidates(categoryId, nextMode);
    setModeId(nextMode);
    if (!source.length) { setSession(null); setIndex(0); setAnswers({}); go('session', { modeId:nextMode, index:0, sessionId:'' }); return; }
    const saved = loadSession(categoryId, nextMode);
    const validSaved = saved && saved.questionIds.every((id) => source.some((q) => q.id === id));
    const ids = validSaved ? saved.questionIds : (definition.shuffle ? shuffled(source).slice(0, definition.maxQuestions ?? source.length) : source).map((q) => q.id);
    const nextSession = validSaved ? saved! : createSession(categoryId, nextMode, ids);
    if (!validSaved) saveSession(nextSession);
    setSession(nextSession); setIndex(nextSession.currentIndex); setAnswers(answersFor(nextSession)); go('session', { modeId:nextMode, index:nextSession.currentIndex, sessionId:nextSession.id });
  };
  const selectCategory = (next:CategoryId) => { setCategoryId(next); setModeId('memorize'); setSession(null); setIndex(0); setAnswers({}); go('modes', { categoryId:next, modeId:'memorize', index:0, sessionId:'' }); };
  const beginQuiz = () => {
    if (!session) return;
    if (!history.cheer.firstShown) { persistHistory({ ...history, cheer:{ ...history.cheer, firstShown:true } }); setShowCheer(true); return; }
    go('quiz', { sessionId:session.id, index });
  };
  const saveCurrent = (next:LearningSession) => { setSession(next); saveSession(next); };
  const answer = (choiceIndex:number) => {
    if (!question || answered || !session) return;
    const nextSession = { ...session, answersByQuestionId:{ ...session.answersByQuestionId, [question.id]:{ choiceIndex, answeredAt:new Date().toISOString() } }, updatedAt:new Date().toISOString() };
    saveCurrent(nextSession); setAnswers((old) => ({ ...old, [index]:choiceIndex }));
    const isCorrect = choiceIndex === question.answerIndex; const old = history.answers[question.id] || { attempts:0,correct:0,wrong:0,streak:0,lastAt:'',avgSeconds:0 }; const today = history.today === new Date().toISOString().slice(0,10) ? history.todayTotal : 0;
    persistHistory({ ...history, total:history.total + 1, today:new Date().toISOString().slice(0,10), todayTotal:today + 1, answers:{ ...history.answers, [question.id]:{ ...old, attempts:old.attempts+1, correct:old.correct+(isCorrect?1:0), wrong:old.wrong+(isCorrect?0:1), streak:isCorrect?old.streak+1:0, lastAt:new Date().toISOString() } }, wrongIds:isCorrect ? history.wrongIds : [...new Set([...history.wrongIds, question.id])] });
  };
  const next = () => {
    if (!session) return; const nextIndex = index + 1;
    if (nextIndex >= activeQuestions.length) { saveCurrent({ ...session, currentIndex:index, updatedAt:new Date().toISOString() }); go('modes'); return; }
    const nextSession = { ...session, currentIndex:nextIndex, updatedAt:new Date().toISOString() }; saveCurrent(nextSession); setIndex(nextIndex); go('quiz', { index:nextIndex, sessionId:nextSession.id });
  };
  const menu:QuizBackActions = { canGoPrevious:index>0, onPrevious:() => { if (!session || index===0) return; const previous=index-1; const nextSession={...session,currentIndex:previous,updatedAt:new Date().toISOString()}; saveCurrent(nextSession); setIndex(previous); go('quiz',{index:previous,sessionId:nextSession.id}); }, onCategory:() => go('modes'), onCategories:() => { setSession(null); go('categories'); }, onHome:() => { setSession(null); go('home'); } };
  const modeCounts = Object.fromEntries(learningModes.map((mode) => [mode.id, Math.min(candidates(categoryId, mode.id).length, mode.maxQuestions ?? Number.POSITIVE_INFINITY)]));

  if (showCheer) return <main className="app cheer-screen"><div className="cheer-avatar">🦉</div><p className="speaker">森の学習案内</p><div className="bubble">「まずは、このセットを1問ずつ進めよう。」</div><p className="cheer-status">{titleFor[categoryId]}・{modeById(modeId).title}</p><button className="primary" onClick={() => { setShowCheer(false); go('quiz', { sessionId:session?.id, index }); }}>問題へ進む</button></main>;
  if (screen === 'home') return <main className="app home-screen"><section className="home-title"><span>🌿</span><p className="eyebrow">SCOA・3尺度版 対策</p><h1>SCOA 型トレーニング</h1><p>文章が違っても、まず「この型」を見つけよう。</p></section><section className="home-main"><div className="home-icon">🦉</div><h2>型を見抜く練習を<br/>始めよう。</h2><button className="primary" onClick={() => go('categories')}>学習をはじめる</button></section></main>;
  if (screen === 'categories') return <main className="app"><Header title="カテゴリを選ぶ" onBack={() => go('home')} />{(['factorization','saltwater-alligation','sequence-patterns'] as CategoryId[]).map((id) => <button key={id} className="selection-card" onClick={() => selectCategory(id)}><span className="card-icon">{id==='factorization'?'🟣':id==='saltwater-alligation'?'⚖️':'🔢'}</span><span className="card-copy"><b>{titleFor[id]}</b><small>{id==='saltwater-alligation'?'天秤の型を見つける':id==='sequence-patterns'?'差・比・交互を順番に見る':'公式の型を見分ける'}</small><em>全 {categoryQuestions(id).length}問</em></span><span className="card-arrow">›</span></button>)}</main>;
  if (screen === 'modes') return <main className="app"><Header title="学習モードを選ぶ" onBack={() => go('categories')} /><p className="page-lead">{titleFor[categoryId]}で、今やる練習を選びます。</p><div className="mode-list">{learningModes.map((mode) => { const count=modeCounts[mode.id] ?? 0; return <button key={mode.id} disabled={count===0} className="selection-card mode-card" onClick={() => startMode(mode.id)}><span className="card-icon">{mode.icon}</span><span className="card-copy"><b>{mode.title}</b><small>{mode.description}</small><em>{count ? `${count}問` : mode.id==='weak' ? '対象なし' : '準備中'}</em></span><span className="card-arrow">›</span></button>; })}</div></main>;
  if (screen === 'session') { const mode=modeById(modeId); if (!session) return <main className="app"><Header title="問題セット" onBack={() => go('modes')} /><section className="empty-card"><span>🌱</span><h2>{modeId==='weak'?'このカテゴリには、まだ復習する問題がありません':'このモードは準備中です'}</h2><p>全問題へ切り替えず、この画面で止まります。</p></section></main>; return <main className="app"><Header title="問題セットを確認" onBack={() => go('modes')} /><section className="empty-card"><span>{mode.icon}</span><h2>{titleFor[categoryId]}</h2><p>{mode.title}</p><p><b>全 {session.questionIds.length}問</b></p><button className="primary" onClick={beginQuiz}>{session.currentIndex ? '続きから始める' : 'このセットを始める'}</button></section></main>; }
  if (!question || !session) return <main className="app"><Header title="問題セット" onBack={() => go('modes')} /><p>問題セットを選び直してください。</p></main>;
  if (answered && question.saltwater) return <SaltwaterAnswerExplanation question={question} isCorrect={correct} index={index} total={activeQuestions.length} menu={menu} onNext={next} />;
  const typeName = question.saltwater?.problemPattern ?? question.sequence?.problemPattern ?? '公式の型';
  return <main className="app quiz-screen"><header className="screen-header"><BackMenu {...menu}/><h1>{titleFor[categoryId]}</h1><span>{index+1} / {activeQuestions.length}</span></header><p className="session-label">{modeById(modeId).title}・全{activeQuestions.length}問</p><section className="question-card"><p className="type">🟣 型：{typeName}</p><h2 className="question-text">{question.question}</h2><div className="look-block"><b>🔎 見る場所</b><span>{question.triggerWords.join(' ・ ')}</span></div><div className="rule-block"><b>💡 合言葉</b><span>{question.shortRule}</span></div></section><div className="choices">{question.choices.map((choice, choiceIndex) => <button key={choice} disabled={answered} className={!answered?'':choiceIndex===question.answerIndex?'correct':choiceIndex===selected?'wrong':'muted-choice'} onClick={() => answer(choiceIndex)}><span>{'ABCD'[choiceIndex]}</span>{choice}</button>)}</div>{answered && <section className="answer-feedback"><div className={correct?'result-banner correct-banner':'result-banner wrong-banner'}><span>{correct?'○ 正解':'× ちがうよ'}</span></div><div className="explain-section"><p className="section-kicker">今回の型</p><h2>{typeName}</h2></div><div className="explain-section"><Diagram question={question}/></div><div className="answer-block"><span>答え</span><strong>{question.choices[question.answerIndex]}</strong><p>{question.explanation}</p></div><p className="mistake">⚠ {question.mistakeReason}</p><button className="primary next-button" onClick={next}>{index+1===activeQuestions.length?'モード選択へ':'次の問題へ'}</button></section>}</main>;
}

function Header({title,onBack}:{title:string;onBack:()=>void}) { return <header className="screen-header"><button className="back-button" onClick={onBack}>← 戻る</button><h1>{title}</h1><span /></header>; }
