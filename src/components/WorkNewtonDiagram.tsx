import type { WorkNewtonData } from '../types';

export function WorkNewtonDiagram({data}:{data:WorkNewtonData}) {
  const v=data.values;
  return <div className="speed-diagram">
    <p className="speed-tip">🦉 {data.characterTip}</p>
    <p className="speed-clue"><b>型を決める合図</b>{data.readingClues.join(' ・ ')}<small>{data.clueReason}</small></p>
    {data.diagramMode==='identify' ? <div className="speed-identify"><b>計算の前に、言葉の合図を探す</b><span>{data.clueReason}</span></div> :
      <div className="speed-table"><b>{data.diagramMode==='queue'?'行列を区間に分ける':'全体を整数の個数で考える'}</b>
        {data.knownFacts.map((fact)=><span key={fact}>{fact}</span>)}
        {v.total !== undefined && <span>全体：<b>{v.total}個ぶん</b></span>}
        {v.a !== undefined && <span>A：毎分 <b>{v.a}個ぶん</b></span>}
        {v.b !== undefined && <span>B：毎分 <b>{v.b}個ぶん</b></span>}
        <small>{data.diagramMode==='queue'?'増える人数と通れる人数を、同じ「人/分」でそろえる':'分数にせず、足し算・引き算・割り算で進める'}</small>
      </div>}
  </div>;
}
