import type { SaltwaterData } from '../types';

const hiddenAt = (position:'low'|'target'|'high', hidden?:string) =>
  hidden === `${position}-concentration` || (position === 'target' && hidden === 'target-concentration') ||
  (position === 'low' && (hidden === 'low-amount' || hidden === 'total-amount')) ||
  (position === 'high' && hidden === 'high-amount');

function label(data:SaltwaterData, position:'low'|'target'|'high', revealAnswer:boolean) {
  const raw = position === 'low' ? data.lowLabel : position === 'target' ? data.targetLabel : data.highLabel;
  if (revealAnswer) {
    let complete = raw;
    if (data.unknownPosition === 'target-concentration') complete = complete.replace('？％', `${data.targetConcentration}％`);
    if (data.unknownPosition === 'low-concentration') complete = complete.replace('？％', `${data.lowConcentration}％`);
    if (data.unknownPosition === 'high-concentration') complete = complete.replace('？％', `${data.highConcentration}％`);
    if (data.unknownPosition === 'amount-ratio') complete = position === 'target' ? `重さ ${data.amountRatio}` : complete;
    if (data.unknownPosition === 'total-amount' && position === 'target') complete = complete.replace('？g', `${data.validationData.expected}g`);
    if (position === 'low' && data.lowAmount !== undefined) complete = complete.replace('？g', `${data.lowAmount}g`);
    if (position === 'high' && data.highAmount !== undefined) complete = complete.replace('？g', `${data.highAmount}g`);
    return complete;
  }
  if (!hiddenAt(position, data.unknownPosition)) return raw;
  if (data.unknownPosition === 'low-concentration' && position === 'low') return '？％';
  if (data.unknownPosition === 'target-concentration' || data.unknownPosition === 'high-concentration') return position === 'target' || position === 'high' ? '？％' : raw;
  if (data.unknownPosition === 'amount-ratio') return position === 'target' ? '重さ ？：？' : raw;
  if (data.unknownPosition === 'total-amount') return position === 'target' ? '完成後 ？g' : raw.replace(/？g/g, '？g');
  return raw.replace(/？g/g, '？g');
}

export function SaltwaterAlligationDiagram({ data, revealAnswer = false }: { data: SaltwaterData; revealAnswer?: boolean }) {
  const isEvaporation = data.diagramMode === 'evaporation';
  return <div className={`salt-diagram ${revealAnswer ? 'salt-complete' : 'salt-before'}`}>
    <p className="salt-tip">🦊 {data.characterTip}</p>
    <div className="salt-points">
      <div className="salt-point low"><b>{isEvaporation ? '蒸発した水' : '低い濃度'}</b><strong>{label(data,'low',revealAnswer)}</strong></div>
      <div className="salt-point target"><b>{isEvaporation ? '蒸発前' : '目標・答え'}</b><strong>{label(data,'target',revealAnswer)}</strong></div>
      <div className="salt-point high"><b>{isEvaporation ? '蒸発後に残る' : '高い濃度'}</b><strong>{label(data,'high',revealAnswer)}</strong></div>
    </div>
    {isEvaporation && <p className="evaporation-note"><b>読み替え</b> 残った食塩水 ＋ 蒸発した0％の水 ＝ 蒸発前の食塩水</p>}
    {!revealAnswer ? <div className="salt-steps"><div><b>分かっているもの</b><span>問題文にある濃度と重さだけを置く</span></div><div><b>求めるもの</b><span>{data.questionIntent}</span></div></div>
      : <div className="salt-steps"><div><b>濃度差</b><span>{data.targetConcentration}－{data.lowConcentration}＝{data.leftDifference}</span><span>{data.highConcentration}－{data.targetConcentration}＝{data.rightDifference}</span></div><div className="salt-cross"><b>反対側へ</b><span>差は反対側の重さにつながる</span></div><div className="salt-ratio"><b>重さの比</b><strong>{data.amountRatio}</strong></div></div>}
  </div>;
}
