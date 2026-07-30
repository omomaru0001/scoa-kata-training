import type { Question } from '../types';
import { Diagram } from './Diagram';
import { BackMenu, type QuizBackActions } from './BackMenu';
import { MixedConcentrationPositionDiagram } from './MixedConcentrationPositionDiagram';

type Props = { question: Question; isCorrect: boolean; index: number; total: number; menu: QuizBackActions; onNext: () => void };

export function SaltwaterAnswerExplanation({ question, isCorrect, index, total, menu, onNext }: Props) {
  const s = question.saltwater!;
  const mixed = question.typeId === 'mixed-concentration' && s.mixedConcentration;
  const answer = question.choices[question.answerIndex];
  const m = s.mixedConcentration;
  return <main className="app quiz-screen">
    <header className="screen-header"><BackMenu {...menu} /><h1>食塩水・濃度｜天秤算</h1><span>{index + 1} / {total}</span></header>
    <section className="answer-feedback">
      <div className={isCorrect ? 'result-banner correct-banner' : 'result-banner wrong-banner'}><span>{isCorrect ? '○ 正解' : '× ちがうよ'}</span><p>{isCorrect ? 'この型で大丈夫！' : 'おしい！ ？から順に求めよう。'}</p></div>
      <div className="explain-section"><p className="section-kicker">今回の型</p><h2>{s.problemPattern}</h2><p className="rule">💡 {question.shortRule}</p></div>
      <div className="reading-summary"><p><b>問題文から分かっていること</b>{s.readingClues.join('・')}</p><p><b>何を求める？</b>{s.questionIntent}</p></div>
      {mixed && m ? <>
        <div className="explain-section"><p className="section-kicker">導出前：分かっているもの</p><MixedConcentrationPositionDiagram data={s} /></div>
        <div className="explain-section derivation-steps"><p className="section-kicker">？％を求める手順</p><ol>
          <li><b>重さの比</b>：{s.lowAmount}：{s.highAmount}＝{m.simplifiedAmountRatio.join('：')}</li>
          <li><b>濃度の距離は反対</b>：低い方から？まで：？から高い方まで＝{m.inverseDistanceRatio.join('：')}</li>
          <li><b>両端の差</b>：{s.highConcentration}－{s.lowConcentration}＝{m.totalConcentrationGap}ポイント</li>
          <li><b>1つ分</b>：{m.totalConcentrationGap}÷（{m.inverseDistanceRatio.join('＋')}）＝{m.gapUnit}ポイント</li>
          <li><b>低い方から進む</b>：{m.gapUnit}×{m.inverseDistanceRatio[0]}＝{m.distanceFromLow}ポイント</li>
        </ol></div>
        <div className="answer-block"><span>答えが決まる</span><strong>{s.lowConcentration}＋{m.distanceFromLow}＝{answer}</strong><p>🦊 濃い方を多く使うから、答えは濃い方に近づくよ。</p></div>
        <div className="explain-section completed-diagram"><p className="section-kicker">答えを入れた完成図</p><MixedConcentrationPositionDiagram data={s} revealAnswer /></div>
      </> : <>
        <div className="explain-section"><p className="section-kicker">導出前の天秤図</p><Diagram question={question} revealAnswer={false} /></div>
        <div className="explain-section"><p className="section-kicker">？を求める手順</p><ol><li>問題文で分かる濃度と重さだけを使う</li><li>差は反対側の重さにつなぐ</li><li>比から？を求める</li></ol></div>
        <div className="answer-block"><span>答えが決まる</span><strong>{answer}</strong><p>{question.explanation}</p></div>
        <div className="explain-section completed-diagram"><p className="section-kicker">答えを入れた完成図</p><Diagram question={question} revealAnswer /></div>
      </>}
      <p className="mistake">⚠ 間違えやすいポイント：{question.mistakeReason}</p>
      <details><summary>なぜそうなる？</summary><p>{question.deepExplanation}</p></details>
      <button className="primary next-button" onClick={onNext}>次の問題へ</button>
    </section>
  </main>;
}
