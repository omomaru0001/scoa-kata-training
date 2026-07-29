import type { SaltwaterData } from '../types';

export function SaltwaterAlligationDiagram({ data, revealAnswer = false }: { data: SaltwaterData; revealAnswer?: boolean }) {
  const hidden = data.unknownPosition;
  const label = (position:'low'|'target'|'high', value:string) => !revealAnswer && (hidden === `${position}-concentration` || (position === 'target' && hidden === 'target-concentration')) ? '？％' : value;
  const isEvaporation = data.diagramMode === 'evaporation';
  const isTargetUnknown = hidden === 'target-concentration';
  return <div className="salt-diagram">
    <p className="salt-tip">🦊 {data.characterTip}</p>
    <div className="salt-points"><div className="salt-point low"><b>低い</b><strong>{label('low', data.lowLabel)}</strong></div><div className="salt-point target"><b>{isEvaporation ? '元の濃度' : '目標'}</b><strong>{label('target', data.targetLabel)}</strong></div><div className="salt-point high"><b>高い</b><strong>{label('high', data.highLabel)}</strong></div></div>
    {isEvaporation && <p className="evaporation-note"><b>読み替え</b> 残った10％の食塩水 ＋ 蒸発した0％の水 ＝ 蒸発前の8％の食塩水</p>}
    {!revealAnswer && hidden ? <div className="salt-steps"><div><b>① 分かっている比</b><span>{data.knownWeight ?? '問題文の重さの比を使う'}</span></div><div className="salt-cross"><b>② 反対側へ</b><span>差は反対側の重さにつなぐ</span></div><div><b>③ 求めるもの</b><span>{data.hiddenValue?.includes('％') ? '？％の位置を求める' : data.hiddenValue?.includes('g') ? '？gを求める' : '？：？を求める'}</span></div></div> : <div className="salt-steps"><div><b>① 差</b><span>{data.targetConcentration}－{data.lowConcentration}＝{data.leftDifference}</span><span>{data.highConcentration}－{data.targetConcentration}＝{data.rightDifference}</span></div><div className="salt-cross"><b>② 反対側へ</b><span>差は反対側の重さにつなぐ</span></div><div className="salt-ratio"><b>③ 重さの比</b><strong>{revealAnswer ? `${data.lowLabel}：${data.highLabel} ＝ ${data.amountRatio}` : '？：？'}</strong>{data.knownWeight && <small>わかっている重さ：{data.knownWeight}</small>}</div></div>}
    {revealAnswer && <p className="sequence-next"><b>求めた答えを入れると</b><strong>{data.hiddenValue}</strong></p>}
  </div>;
}
