import type { SaltwaterData } from '../types';

export function MixedConcentrationPositionDiagram({ data, revealAnswer = false }: { data: SaltwaterData; revealAnswer?: boolean }) {
  const m = data.mixedConcentration;
  if (!m) return null;
  const [leftParts, rightParts] = m.inverseDistanceRatio;
  return <div className={revealAnswer ? 'weighted-position weighted-position-complete' : 'weighted-position'}>
    {!revealAnswer ? <>
      <div className="weighted-line"><span className="weighted-low">{data.lowConcentration}％・{data.lowAmount}g</span><i /><span className="weighted-high">{data.highConcentration}％・{data.highAmount}g</span></div>
      <p className="weighted-unknown">中央の濃度は <b>？％</b></p>
      <div className="weighted-cards"><p><b>重さの比</b>{m.simplifiedAmountRatio.join('：')}</p><p><b>濃度の距離（反対）</b>{leftParts}：{rightParts}</p></div>
    </> : <>
      <div className="weighted-line"><span className="weighted-low">{data.lowConcentration}％・{data.lowAmount}g</span><i /><span className="weighted-target">{m.derivedTargetConcentration}％</span><i /><span className="weighted-high">{data.highConcentration}％・{data.highAmount}g</span></div>
      <div className="weighted-cards"><p><b>低い方から進む距離</b>{m.distanceFromLow}ポイント</p><p><b>高い方までの距離</b>{m.distanceFromHigh}ポイント</p></div>
    </>}
  </div>;
}
