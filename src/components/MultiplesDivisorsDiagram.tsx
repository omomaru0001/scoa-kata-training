import type { MultiplesDivisorsData } from '../types';

const lcm = (values:number[]) => values.reduce((answer, value) => answer * value / gcd(answer, value));
const gcd = (a:number, b:number):number => b ? gcd(b, a % b) : a;

function Ladder({ data, kind }:{data:MultiplesDivisorsData; kind:'lcm'|'gcd'}) {
  const values=data.numbers ?? [];
  const result=kind==='lcm' ? lcm(values) : values.reduce(gcd);
  return <div className="multiple-ladder" aria-label={kind==='lcm'?'最小公倍数の連除法':'最大公約数の連除法'}>
    <p className="multiple-label">連除法（はしご算）</p>
    <div className="ladder-values"><span>{values.join('　')}</span><b>{kind==='lcm'?'最小公倍数':'最大公約数'}：{result}</b></div>
    <div className="ladder-steps">{data.ladderSteps?.slice(0,2).map((step) => <span key={step}>{step.replace(/^① |^② /,'')}</span>)}</div>
  </div>;
}

export function MultiplesDivisorsDiagram({ data }:{data:MultiplesDivisorsData}) {
  const { diagramMode }=data;
  return <div className="multiple-diagram">
    <p className="multiple-tip">🦉 {data.characterTip}</p>
    {diagramMode==='ladder-lcm' && <Ladder data={data} kind="lcm" />}
    {diagramMode==='ladder-gcd' && <Ladder data={data} kind="gcd" />}
    {diagramMode==='divisors' && <div className="divisor-list"><b>{data.divisorTarget}の正の約数</b><span>{data.divisorList?.join('、')}</span><strong>全部を足す</strong></div>}
    {diagramMode==='remainder' && <div className="offset-diagram"><b>同じ余り：{data.remainder}</b><span>最小公倍数 × m ＋ {data.remainder}</span><small>余りは最後に足す</small></div>}
    {diagramMode==='shortage' && <div className="offset-diagram shortage"><b>共通の不足：{data.shortage}</b><span>最小公倍数 × m － {data.shortage}</span><small>「あと{data.shortage}で割り切れる」と読む</small></div>}
    {diagramMode==='inclusion' && <div className="inclusion-diagram"><span>{data.numbers?.[0]}の倍数</span><i>＋</i><span>{data.numbers?.[1]}の倍数</span><i>－</i><strong>両方の倍数</strong><small>重なった分は1回引く</small></div>}
    {diagramMode==='identify' && <div className="identify-diagram"><b>計算の前に、問題文の合図を探す</b><span>{data.readingClues.join(' ・ ')}</span></div>}
  </div>;
}
