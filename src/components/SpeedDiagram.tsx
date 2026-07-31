import type { SpeedData } from '../types';

const fact = (data:SpeedData, key:string, suffix='') => data.values[key] === undefined ? '？' : `${data.values[key]}${suffix}`;

export function SpeedDiagram({ data }:{data:SpeedData}) {
  const v=data.values;
  const usesMeters = data.validationData.unit==='m/分' || data.validationData.unit==='m' || (data.diagramMode==='meeting' && Number(v.distance)>=100) || (data.diagramMode==='circuit' && Number(v.lap)>=100);
  const speedUnit=usesMeters?'m/分':'km/h';
  const distanceUnit=usesMeters?'m':'km';
  return <div className="speed-diagram">
    <p className="speed-tip">🦉 {data.characterTip}</p>
    <p className="speed-clue"><b>型を決める合図</b>{data.readingClues.join(' ・ ')}<small>{data.clueReason}</small></p>
    {data.diagramMode==='basic' && <div className="speed-cards"><span>速さ<br/><b>{fact(data,'speed',speedUnit)}</b></span><span>距離<br/><b>{fact(data,'distance',distanceUnit)}</b></span><span>時間<br/><b>{fact(data,'timeMinutes','分')}</b></span></div>}
    {data.diagramMode==='segments' && <div className="speed-table"><b>区間ごとに分ける</b><span>1つ目：距離 {fact(data,'d1',distanceUnit)} ／ 速さ {fact(data,'s1',speedUnit)}</span><span>2つ目：距離 {fact(data,'d2',distanceUnit)} ／ 速さ {fact(data,'s2',speedUnit)}</span><small>それぞれの時間または距離を出してから合計する</small></div>}
    {data.diagramMode==='meeting' && <div className="speed-line meeting-line"><span>A {fact(data,'a',speedUnit)}</span><i>→　距離 {fact(data,'distance',distanceUnit)}　←</i><span>B {fact(data,'b',speedUnit)}</span><b>向かい合うので、2人の速さを足す</b></div>}
    {data.diagramMode==='chase' && <div className="speed-line chase-line"><span>先の人 {fact(data,'slow',speedUnit)}</span><i>→　先に出た時間 {fact(data,'leadMinutes','分')}　→</i><span>後の人 {fact(data,'fast',speedUnit)}</span><b>同じ方向なので、速さの差を使う</b></div>}
    {data.diagramMode==='circuit' && <div className="speed-circuit"><b>1周 {fact(data,'lap',distanceUnit)}</b><span>A {fact(data,'a',speedUnit)} ／ B {fact(data,'b',speedUnit)}</span><small>{v.direction==='反対'?'反対方向：速さを足す':'同じ方向：速さを引く'}</small></div>}
    {data.diagramMode==='arrival' && <div className="speed-table arrival-table"><b>距離は同じ</b><span>普段の速さ：{fact(data,'normal',speedUnit)}</span><span>変えた後の速さ：{fact(data,'changed',speedUnit)}</span><span>時間の差：{fact(data,'differenceMinutes','分')}</span><small>時間だけが変わるので、2つの距離を同じにする</small></div>}
    {data.diagramMode==='average' && <div className="speed-table average-table"><b>全部で計算する</b><span>行き：距離 {fact(data,'distance',distanceUnit)} ／ 速さ {fact(data,'go',speedUnit)}</span><span>帰り：距離 {fact(data,'distance',distanceUnit)} ／ 速さ {fact(data,'back',speedUnit)}</span><small>全体の距離 ÷ 全体の時間</small></div>}
    {data.diagramMode==='identify' && <div className="speed-identify"><b>計算の前に、問題文の合図を探す</b><span>{data.clueReason}</span></div>}
  </div>;
}
