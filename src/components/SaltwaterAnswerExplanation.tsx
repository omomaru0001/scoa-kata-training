import type { Question } from '../types';
import { Diagram } from './Diagram';
import { BackMenu, type QuizBackActions } from './BackMenu';
import { MixedConcentrationPositionDiagram } from './MixedConcentrationPositionDiagram';

type Props = { question: Question; isCorrect: boolean; index: number; total: number; menu: QuizBackActions; onNext: () => void };

export function SaltwaterAnswerExplanation({ question, isCorrect, index, total, menu, onNext }: Props) {
  const s = question.saltwater!;
  const answer = question.choices[question.answerIndex];
  const isMixed = question.typeId === 'mixed-concentration' && s.mixedConcentration;
  const DiagramForStage = ({ reveal }: { reveal:boolean }) => isMixed
    ? <MixedConcentrationPositionDiagram data={s} revealAnswer={reveal} />
    : <Diagram question={question} revealAnswer={reveal} />;

  return <main className="app quiz-screen">
    <header className="screen-header"><BackMenu {...menu} /><h1>食塩水・濃度｜天秤算</h1><span>{index + 1} / {total}</span></header>
    <section className="answer-feedback">
      <div className={isCorrect ? 'result-banner correct-banner' : 'result-banner wrong-banner'}>
        <span>{isCorrect ? '○ 正解' : '× ちがうよ'}</span><p>{isCorrect ? 'この順番で進められたね。' : 'おしい！ 分かっているものから順に見よう。'}</p>
      </div>
      <div className="explain-section"><p className="section-kicker">今回の型</p><h2>{s.problemPattern}</h2><p className="rule">💡 {question.shortRule}</p></div>
      <div className="reading-summary">
        <p><b>問題文から分かっていること</b>{(s.knownFacts ?? s.readingClues).join('・')}</p>
        <p><b>何を求める？</b>{s.questionIntent}</p>
      </div>
      <div className="explain-section"><p className="section-kicker">導出前：まず天秤に置くもの</p><DiagramForStage reveal={false} /></div>
      <div className="explain-section derivation-steps"><p className="section-kicker">？を求める手順</p><ol>{(s.derivationSteps ?? []).map((step) => <li key={step}>{step}</li>)}</ol></div>
      <div className="answer-block"><span>答えが決まる</span>{(s.answerDerivation ?? []).map((step) => <p key={step}>{step}</p>)}<strong>{answer}</strong></div>
      {s.saltCheck?.length ? <div className="explain-section"><p className="section-kicker">食塩の量で確認</p><ul className="compact-steps">{s.saltCheck.map((step) => <li key={step}>{step}</li>)}</ul></div> : null}
      <div className="explain-section completed-diagram"><p className="section-kicker">答えを入れた完成図</p><DiagramForStage reveal /></div>
      <p className="mistake">⚠ 間違えやすいポイント：{question.mistakeReason}</p>
      <details><summary>なぜそうなる？</summary><p>{question.deepExplanation}</p></details>
      <button className="primary next-button" onClick={onNext}>{index + 1 === total ? 'モード選択へ' : '次の問題へ'}</button>
    </section>
  </main>;
}
