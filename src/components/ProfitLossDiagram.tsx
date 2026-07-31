import type { ProfitLossData } from '../types';

export function ProfitLossDiagram({data}:{data:ProfitLossData}) {
  return <div className="speed-diagram"><p className="speed-tip">🦉 {data.characterTip}</p>
    <p className="speed-clue"><b>型を決める合図</b>{data.readingClues.join(' ・ ')}<small>{data.clueReason}</small></p>
    {data.diagramMode==='identify' ? <div className="speed-identify"><b>計算の前に、何を求めるかを見る</b><span>{data.clueReason}</span></div> : <div className="speed-table"><b>原価を100円として考える</b>{data.knownFacts.map((x)=><span key={x}>{x}</span>)}<span>原価 <b>100</b> → 利益を足して定価 → 割引を引いて売値</span><small>％をそのまま整数として動かす</small></div>}
  </div>;
}
