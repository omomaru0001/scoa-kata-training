import type { SaltwaterData } from '../types';

export function SaltwaterAlligationDiagram({ data }: { data: SaltwaterData }) {
  const isEvaporation = data.diagramMode === 'evaporation';
  return <div className="salt-diagram">
    <p className="salt-tip">🦊 {data.characterTip}</p>
    <div className="salt-points">
      <div className="salt-point low"><b>低い</b><strong>{data.lowLabel}</strong></div>
      <div className="salt-point target"><b>{isEvaporation ? '元の濃度' : '目標'}</b><strong>{data.targetLabel}</strong></div>
      <div className="salt-point high"><b>高い</b><strong>{data.highLabel}</strong></div>
    </div>
    {isEvaporation && <p className="evaporation-note"><b>読み替え</b> 残った10％の食塩水 ＋ 蒸発した0％の水 ＝ 蒸発前の8％の食塩水</p>}
    <div className="salt-steps">
      <div><b>① 差</b><span>{data.targetConcentration}－{data.lowConcentration}＝{data.leftDifference}</span><span>{data.highConcentration}－{data.targetConcentration}＝{data.rightDifference}</span></div>
      <div className="salt-cross"><b>② 反対側へ</b><span>{data.lowLabel} 側の重さ → {data.rightDifference}</span><span>{data.highLabel} 側の重さ → {data.leftDifference}</span></div>
      <div className="salt-ratio"><b>③ 重さの比</b><strong>{data.lowLabel}：{data.highLabel} ＝ {data.amountRatio}</strong>{data.knownWeight && <small>わかっている重さ：{data.knownWeight}</small>}{data.unknownPosition && <small>求めるもの：{data.unknownPosition}</small>}</div>
    </div>
  </div>;
}
