import type { SequenceData } from '../types';

export function SequencePatternDiagram({ data }: { data: SequenceData }) {
  const chunks = data.sequenceValues.reduce<(number|null)[][]>((all, value, index) => {
    const group = Math.floor(index / 4); (all[group] ||= []).push(value); return all;
  }, []);
  return <div className="sequence-diagram">
    <p className="sequence-tip">🦉 {data.characterTip}</p>
    <p className="sequence-rule">見る順番：<b>{data.readingOrder}</b></p>
    {chunks.map((chunk, chunkIndex) => <div className="sequence-row" key={chunkIndex}>{chunk.map((value, valueIndex) => <span key={`${chunkIndex}-${valueIndex}`} className={value === null ? 'sequence-number blank' : 'sequence-number'}>{value === null ? '□' : value}</span>)}</div>)}
    <div className="sequence-operations">{data.operationPattern.map((operation, index) => <span key={index}>{operation}</span>)}</div>
    {data.differences && <div className="sequence-differences"><b>差</b><span>{data.differences.map((difference) => difference >= 0 ? `＋${difference}` : `${difference}`).join('　')}</span></div>}
    {data.diagramMode === 'fibonacci' && <p className="sequence-note">前の2つを足して、次の数を作る</p>}
    {data.diagramMode === 'alternating' && <p className="sequence-note pink-note">1個おきに、同じ計算が続く</p>}
    <div className="sequence-next"><b>次に入る数</b><strong>{data.nextValues.join('、')}</strong></div>
  </div>;
}
