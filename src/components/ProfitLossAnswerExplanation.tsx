import { BackMenu, type QuizBackActions } from './BackMenu';
import { Diagram } from './Diagram';
import type { Question } from '../types';
export function ProfitLossAnswerExplanation({question,isCorrect,index,total,menu,onNext}:{question:Question;isCorrect:boolean;index:number;total:number;menu:QuizBackActions;onNext:()=>void}) {
 const data=question.profitLoss!;
 return <main className="app quiz-screen"><header className="screen-header"><BackMenu {...menu}/><h1>損益算｜原価100裏技</h1><span>{index+1} / {total}</span></header><p className="session-label">答えへ進む順番</p><section className="answer-feedback speed-answer">
  <div className={isCorrect?'result-banner correct-banner':'result-banner wrong-banner'}><span>{isCorrect?'○ 正解':'× ちがうよ'}</span><p>{isCorrect?'原価100で考えられたね！':'原価100から順に見直そう。'}</p></div>
  <div className="explain-section"><p className="section-kicker">今回の型</p><h2>{data.problemPattern}</h2><p className="rule">💡 {question.shortRule}</p></div>
  <div className="reading-summary"><p><b>問題文の合図</b>{data.readingClues.join(' ・ ')}</p><p><b>この型だと分かる理由</b>{data.clueReason}</p><p><b>分かっていること</b>{data.knownFacts.join(' ・ ')}</p></div>
  <div className="explain-section"><p className="section-kicker">図で使う数字を確認</p><Diagram question={question}/></div><div className="explain-section"><p className="section-kicker">①から順に進める</p><ol>{question.steps.map((s)=><li key={s}>{s}</li>)}</ol></div>
  <div className="answer-block"><span>答え</span><strong>{question.choices[question.answerIndex]}</strong><p>{question.explanation}</p></div><p className="mistake">⚠ 間違えやすいポイント：{question.mistakeReason}</p><details><summary>なぜそうなる？</summary><p>{question.deepExplanation}</p></details><button className="primary next-button" onClick={onNext}>{index+1===total?'モード選択へ':'次の問題へ'}</button>
 </section></main>;
}
