import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import questionsJson from './data/questions.json';
import { saltwaterQuestions } from './data/saltwaterQuestions';
import { sequenceQuestions } from './data/sequenceQuestions';
import { formulas } from './data/formulas';
import { cheers } from './constants/cheers';
import { loadHistory, resetHistory, saveHistory, type History } from './lib/storage';
import { Diagram } from './components/Diagram';
import { BackMenu, type QuizBackActions } from './components/BackMenu';
import { SaltwaterAnswerExplanation } from './components/SaltwaterAnswerExplanation';
import type { Question } from './types';
import './styles.css';
import { AppNew } from './AppNew';

const questions = [...(questionsJson as Question[]), ...saltwaterQuestions, ...sequenceQuestions];
type Screen = 'home' | 'categories' | 'modes' | 'formulas' | 'quiz' | 'review' | 'weak';
const speakerNames = { sui: 'すいくん', runa: 'るなちゃん', 'sui-and-runa': 'すいくん・るなちゃん', supporter: '森の学習案内' };
const modeItems = [
  ['🌱', 'まず覚える', '公式を1つずつ見る'], ['🧩', '穴埋め', '公式の一部を選ぶ'],
  ['🔎', '型を見分ける', '使う型だけを選ぶ'], ['✏️', '数字を当てはめる', '公式に数字を入れる'],
  ['📝', '実戦問題', '最初から最後まで解く'], ['🔁', '苦手だけ復習', 'まちがえた型を優先'], ['🎲', 'ランダム確認', '4つの型をまぜる'],
] as const;

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeCategory, setActiveCategory] = useState<'factorization' | 'saltwater-alligation' | 'sequence-patterns'>('factorization');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [setAnswers, setSetAnswers] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<History>(loadHistory);
  const [showCheer, setShowCheer] = useState(false);
  const [cheerId, setCheerId] = useState('cheer-1');
  const activeQuestions = questions.filter((item) => item.categoryId === activeCategory);
  const question = activeQuestions[index % activeQuestions.length];
  const formula = formulas.find((item) => item.id === question.typeId);
  const answered = selected !== null;
  const isCorrect = selected === question.answerIndex;

  useEffect(() => {
    window.history.replaceState({ screen: 'home' }, '');
    const onPopState = (event: PopStateEvent) => {
      setShowCheer(false);
      const restoredIndex = event.state?.index;
      if (typeof restoredIndex === 'number') setIndex(restoredIndex);
      if (event.state?.category) setActiveCategory(event.state.category);
      setScreen((event.state?.screen as Screen) || 'home');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const persist = (next: History) => { setHistory(next); saveHistory(next); };
  const go = (next: Screen) => {
    setScreen(next);
    window.history.pushState({ screen: next, category: activeCategory, index }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = (fallback: Screen = 'home') => {
    if (screen === 'home') return;
    go(fallback);
  };
  const begin = () => {
    if (!history.cheer.firstShown) {
      setCheerId('cheer-1'); setShowCheer(true);
      persist({ ...history, cheer: { ...history.cheer, firstShown: true } });
    } else go('quiz');
  };
  useEffect(() => { if (screen === 'quiz') setSelected(setAnswers[index] ?? null); }, [index, screen, setAnswers]);
  const chooseCategory = (category: 'factorization' | 'saltwater-alligation' | 'sequence-patterns') => {
    setActiveCategory(category); setIndex(0); setSelected(null); setSetAnswers({}); setScreen('modes');
    window.history.pushState({ screen: 'modes', category, index: 0 }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const answer = (choiceIndex: number) => {
    if (answered || setAnswers[index] !== undefined) return;
    setSelected(choiceIndex);
    setSetAnswers((answers) => ({ ...answers, [index]: choiceIndex }));
    const correct = choiceIndex === question.answerIndex;
    const old = history.answers[question.id] || { attempts: 0, correct: 0, wrong: 0, streak: 0, lastAt: '', avgSeconds: 0 };
    const today = history.today === new Date().toISOString().slice(0, 10) ? history.todayTotal : 0;
    persist({
      ...history, total: history.total + 1, today: new Date().toISOString().slice(0, 10), todayTotal: today + 1,
      answers: { ...history.answers, [question.id]: { ...old, attempts: old.attempts + 1, correct: old.correct + (correct ? 1 : 0), wrong: old.wrong + (correct ? 0 : 1), streak: correct ? old.streak + 1 : 0, lastAt: new Date().toISOString() } },
      wrongIds: correct ? history.wrongIds : [...new Set([...history.wrongIds, question.id])],
    });
    window.setTimeout(() => document.querySelector('.answer-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  const next = () => {
    const saved = loadHistory();
    const remaining = saved.cheer.remaining - 1;
    if (remaining <= 0) {
      const candidates = cheers.filter((item) => item.timing === 'before-question' && !saved.cheer.recent.includes(item.id));
      const cheer = candidates[Math.floor(Math.random() * candidates.length)] || cheers[2];
      setCheerId(cheer.id);
      persist({ ...saved, cheer: { ...saved.cheer, remaining: 7 + Math.floor(Math.random() * 3), recent: [...saved.cheer.recent, cheer.id].slice(-3), lastAnswerTotal: saved.total } });
      setIndex(index + 1); setSelected(setAnswers[index + 1] ?? null); setShowCheer(true);
    } else {
      persist({ ...saved, cheer: { ...saved.cheer, remaining } });
      setIndex(index + 1); setSelected(setAnswers[index + 1] ?? null); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const accuracy = history.total ? Math.round(Object.values(history.answers).reduce((sum, item) => sum + item.correct, 0) / history.total * 100) : 0;
  const cheer = cheers.find((item) => item.id === cheerId)!;
  const quizMenu: QuizBackActions = {
    canGoPrevious: index > 0,
    onPrevious: () => { if (index > 0) { const previous = index - 1; setIndex(previous); setSelected(setAnswers[previous] ?? null); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    onCategory: () => go('modes'),
    onCategories: () => go('categories'),
    onHome: () => go('home'),
  };
  const bottomNav = <nav className="bottom-nav"><button onClick={() => go('home')}>🏡 ホーム</button><button onClick={() => go('formulas')}>📒 公式一覧</button><button onClick={() => go('review')}>🔁 復習</button></nav>;

  if (showCheer) return <main className="app cheer-screen"><div className="cheer-avatar">{cheer.speaker === 'runa' ? '🐰' : cheer.speaker === 'sui' ? '🦊' : '🦉'}</div><p className="speaker">{speakerNames[cheer.speaker]}</p><div className="bubble">「{cheer.message}」</div><p className="cheer-status">今日の回答数：{history.todayTotal}問</p><button className="primary" onClick={() => { setShowCheer(false); go('quiz'); }}>次の問題へ</button></main>;

  if (screen === 'home') return <main className="app home-screen"><section className="home-title"><span aria-hidden>🌿</span><p className="eyebrow">SCOA・3尺度版 対策</p><h1>SCOA 型トレーニング</h1><p>文章が違っても、まず「この型」を見つけよう。</p></section><section className="study-summary"><span><b>{history.todayTotal}</b> 今日の回答</span><span><b>{accuracy}%</b> 正解率</span></section><section className="home-main"><div className="home-icon">🦉</div><h2>型を見抜く練習を<br />始めよう。</h2><p>公式・見る場所・合言葉の順に覚えられます。</p><button className="primary" onClick={() => go('categories')}>学習をはじめる</button></section><div className="home-subactions"><button onClick={() => go('formulas')}>📒 因数分解の4公式を見る</button><button onClick={() => go('weak')}>🔁 苦手な型を復習</button></div>{bottomNav}</main>;

  if (screen === 'categories') return <main className="app"><ScreenHeader title="カテゴリを選ぶ" onBack={() => goBack()} /><button className="selection-card" onClick={() => chooseCategory('factorization')}><span className="card-icon">🟣</span><span className="card-copy"><b>因数分解・公式暗記</b><small>4つの公式を、見分けるところから</small><em>全 {questions.filter((item) => item.categoryId === 'factorization').length} 問</em></span><span className="card-arrow">›</span></button><button className="selection-card salt-category" onClick={() => chooseCategory('saltwater-alligation')}><span className="card-icon">⚖️</span><span className="card-copy"><b>食塩水・濃度｜天秤算</b><small>天秤を使えば、言い方が変わっても同じ型</small><em>代表 {saltwaterQuestions.length} 問</em></span><span className="card-arrow">›</span></button><button className="selection-card sequence-category" onClick={() => chooseCategory('sequence-patterns')}><span className="card-icon">🔢</span><span className="card-copy"><b>数列｜規則の見つけ方</b><small>差・比・交互を順番に見れば、規則が見つかる</small><em>代表 {sequenceQuestions.length} 問</em></span><span className="card-arrow">›</span></button>{bottomNav}</main>;

  if (screen === 'modes') return <main className="app"><ScreenHeader title="学習モードを選ぶ" onBack={() => goBack('categories')} /><p className="page-lead">{activeCategory === 'saltwater-alligation' ? '低い・目標・高いの順に置くところから始めます。' : activeCategory === 'sequence-patterns' ? 'まず差、次に割る、次に交互の順に見ます。' : 'まずは「まず覚える」から始めるのがおすすめです。'}</p><div className="mode-list">{modeItems.map(([icon, name, description], itemIndex) => <button key={name} className="selection-card mode-card" onClick={itemIndex === 5 ? () => go('weak') : begin}><span className="card-icon">{icon}</span><span className="card-copy"><b>{name}</b><small>{description}</small></span><span className="card-arrow">›</span></button>)}</div>{bottomNav}</main>;

  if (screen === 'formulas') return <main className="app"><ScreenHeader title="公式・型の一覧" onBack={() => goBack()} /><p className="page-lead">公式を大きく見て、合言葉とセットで覚えよう。</p>{formulas.map((item) => <article className="formula-card" key={item.id}><p className="type">🟣 型：{item.name}</p><h2 className="formula-text">{item.formula}</h2><p className="rule">💡 {item.rule}</p><p className="formula-detail"><b>見る場所</b>{item.lookFor}</p><p className="example"><b>数字入りの例</b>{item.example}</p><div className="mastery"><span>習得の目安</span><progress value={(history.answers[questions.find((q) => q.typeId === item.id)?.id || '']?.correct || 0) * 25} max="100" /></div></article>)}{bottomNav}</main>;

  if (screen === 'review' || screen === 'weak') return <main className="app"><ScreenHeader title={screen === 'review' ? '間違えた問題の復習' : '苦手な型'} onBack={() => goBack()} /><section className="empty-card"><span>🌱</span><h2>{history.wrongIds.length ? `${history.wrongIds.length}問を、もう一度` : '復習リストは空です'}</h2><p>{history.wrongIds.length ? '見る場所から、ゆっくり確認し直せます。' : '最初の1問から、安心して始めましょう。'}</p><button className="primary" onClick={begin}>問題へ進む</button></section><button className="reset-link" onClick={() => { resetHistory(); setHistory(loadHistory()); }}>学習履歴をリセットする</button>{bottomNav}</main>;

  if (answered && question.saltwater) return <SaltwaterAnswerExplanation question={question} isCorrect={isCorrect} index={index} total={activeQuestions.length} menu={quizMenu} onNext={next} />;
  const typeName = question.saltwater?.problemPattern ?? question.sequence?.problemPattern ?? formula?.name ?? '公式の型';
  const categoryTitle = activeCategory === 'saltwater-alligation' ? '食塩水・濃度｜天秤算' : activeCategory === 'sequence-patterns' ? '数列｜規則の見つけ方' : '因数分解・公式暗記';
  const salt = question.saltwater;
  const sequence = question.sequence;
  return <main className="app quiz-screen"><ScreenHeader title={categoryTitle} onBack={() => goBack()} menu={quizMenu} right={`${index + 1} / ${activeQuestions.length}`} /><div className="progress-label"><span>このセットの進み具合</span><b>{index + (answered ? 1 : 0)} / {activeQuestions.length}</b></div><div className="progress-bar"><span style={{ width: `${((index + (answered ? 1 : 0)) / activeQuestions.length) * 100}%` }} /></div><section className="question-card"><p className="type">🟣 型：{typeName}</p><p className="question-label">この問題は、何の型？</p><h2 className="question-text">{question.question}</h2><div className="look-block"><b>🔎 見る場所</b><span>{question.triggerWords.join(' ・ ')}</span></div><div className="rule-block"><b>💡 合言葉</b><span>{question.shortRule}</span></div></section><div className="choices">{question.choices.map((choice, choiceIndex) => <button key={choice} disabled={answered} className={!answered ? '' : choiceIndex === question.answerIndex ? 'correct' : choiceIndex === selected ? 'wrong' : 'muted-choice'} onClick={() => answer(choiceIndex)}><span>{'ABCD'[choiceIndex]}</span>{choice}</button>)}</div>{answered && <section className="answer-feedback"><div className={isCorrect ? 'result-banner correct-banner' : 'result-banner wrong-banner'}><span>{isCorrect ? '○ 正解' : '× ちがうよ'}</span><p>{isCorrect ? 'この型で大丈夫！' : 'おしい！ この問題はここを見るよ。'}</p></div><div className="explain-section"><p className="section-kicker">今回の型</p><h2>{typeName}</h2><p className="rule">💡 {question.shortRule}</p></div>{salt && <div className="reading-summary"><p><b>何をしている？</b>{salt.problemPattern}</p><p><b>何を聞かれている？</b>{salt.questionIntent}</p><p><b>天秤に置く3つ</b>{salt.lowLabel}・{salt.targetLabel}・{salt.highLabel}</p><p><b>今回の型</b>{salt.problemPattern}</p></div>}{sequence && <div className="reading-summary"><p><b>今回の型</b>{sequence.problemPattern}</p><p><b>まず調べる場所</b>{sequence.readingOrder}</p><p><b>分かった規則</b>{sequence.operationPattern.join('、')}</p></div>}<div className="explain-section"><p className="section-kicker">図解で確認</p><Diagram question={question} /></div><div className="explain-section"><p className="section-kicker">手順</p><ol>{question.steps.map((step) => <li key={step}>{step}</li>)}</ol></div><div className="answer-block"><span>答え</span><strong>{question.choices[question.answerIndex]}</strong><p>{question.explanation}</p></div><p className="mistake">⚠ 間違えやすいポイント：{question.mistakeReason}</p><details><summary>なぜそうなる？</summary><p>{question.deepExplanation}</p></details><button className="primary next-button" onClick={next}>次の問題へ</button></section>}</main>;
}

function ScreenHeader({ title, onBack, right, menu }: { title: string; onBack: () => void; right?: string; menu?: QuizBackActions }) {
  return <header className="screen-header">{menu ? <BackMenu {...menu} /> : <button className="back-button" onClick={onBack}>← 戻る</button>}<h1>{title}</h1>{right && <span>{right}</span>}</header>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><AppNew /></React.StrictMode>);
