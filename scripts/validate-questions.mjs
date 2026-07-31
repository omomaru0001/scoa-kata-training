import fs from 'node:fs';
import { saltwaterQuestions } from '../src/data/saltwaterQuestions.ts';
import { sequenceQuestions } from '../src/data/sequenceQuestions.ts';
import { multiplesDivisorsQuestions } from '../src/data/multiplesDivisorsQuestions.ts';
import { speedQuestions } from '../src/data/speedQuestions.ts';
import { workNewtonQuestions } from '../src/data/workNewtonQuestions.ts';

const factorization = JSON.parse(fs.readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const questions = [...factorization, ...saltwaterQuestions, ...sequenceQuestions, ...multiplesDivisorsQuestions, ...speedQuestions, ...workNewtonQuestions];
const required = ['id','categoryId','subcategoryId','typeId','difficulty','learningStage','question','formula','choices','answerIndex','shortRule','triggerWords','steps','explanation','deepExplanation','mistakeReason','diagramType','diagramData','tags'];
const epsilon = 1e-8;
const errors = []; const ids = new Set(); const fingerprints = new Set();
const numeric = (value) => Number(String(value).replace(/[^0-9.]/g, ''));
const includesPercent = (text, value) => text.includes(`${value}％`) || text.includes(`${value}%`);
const includesGram = (text, value) => text.includes(`${value}g`);
const gcd = (a,b) => b ? gcd(b, a % b) : a;
const lcm = (values) => values.reduce((answer, value) => answer * value / gcd(answer, value));
const banned = ['適切な','ある程度','必要な','うまく','いい感じに','適当な量','ある量','ある重さ','一定量','必要な割合','何らかの割合','適切な比率'];

function validateSaltwater(q) {
  const s = q.saltwater;
  if (!s) return errors.push(`${q.id}: 食塩水データがありません`);
  const textFields = [q.question,q.shortRule,q.explanation,q.deepExplanation,q.mistakeReason,...s.readingClues,...(s.knownFacts ?? []),...(s.derivationSteps ?? []),...(s.answerDerivation ?? []),...(s.saltCheck ?? [])].join('\n');
  for (const word of banned) if (textFields.includes(word)) errors.push(`${q.id}: 禁止するあいまい表現「${word}」があります`);
  if (!s.modeIds?.length) errors.push(`${q.id}: 対象モードがありません`);
  if (!s.diagramBeforeAnswer || !s.diagramAfterAnswer || !s.hiddenValue || !s.unknownPosition) errors.push(`${q.id}: 導出前後の図解状態が不足しています`);
  if (!(s.lowConcentration < s.targetConcentration && s.targetConcentration < s.highConcentration)) errors.push(`${q.id}: 低い＜目標＜高い の並びではありません`);
  if (s.leftDifference !== s.targetConcentration - s.lowConcentration || s.rightDifference !== s.highConcentration - s.targetConcentration) errors.push(`${q.id}: 濃度差が一致しません`);
  if (!s.derivationSteps?.length || !s.answerDerivation?.length) errors.push(`${q.id}: 導出手順が不足しています`);

  const answer = q.choices[q.answerIndex];
  if (s.validationData.answerText && answer !== s.validationData.answerText) errors.push(`${q.id}: 正解選択肢が登録値と一致しません`);
  if (s.answerType === 'concentration' || s.answerType === 'amount') {
    if (Math.abs(numeric(answer) - s.validationData.expected) > epsilon) errors.push(`${q.id}: 正解選択肢と内部の答えが一致しません`);
    if (s.validationData.unit === '%' && !answer.includes('％')) errors.push(`${q.id}: 濃度の単位がありません`);
    if (s.validationData.unit === 'g' && !answer.includes('g')) errors.push(`${q.id}: 重さの単位がありません`);
  }
  if (s.answerType === 'ratio' && answer !== s.amountRatio) errors.push(`${q.id}: 比の正解が一致しません`);

  const mix = s.validationData.mix;
  if (mix) {
    const computed = (s.lowConcentration * mix.lowAmount + s.highConcentration * mix.highAmount) / (mix.lowAmount + mix.highAmount);
    if (Math.abs(computed - s.targetConcentration) > epsilon) errors.push(`${q.id}: 食塩量保存の検算に失敗 (${computed}％)`);
    if (Math.abs(mix.lowAmount / mix.highAmount - s.rightDifference / s.leftDifference) > epsilon) errors.push(`${q.id}: 天秤の逆比と重さの比が一致しません`);
  }

  // 問題文に必要な既知情報が実際に書かれているかを、数値解を求める問題で確認する。
  if (q.typeId === 'mixed-concentration') {
    if (!s.lowAmount || !s.highAmount || !includesPercent(q.question,s.lowConcentration) || !includesPercent(q.question,s.highConcentration) || !includesGram(q.question,s.lowAmount) || !includesGram(q.question,s.highAmount)) errors.push(`${q.id}: 混合後濃度は両方の濃度と具体的なg数を問題文に書いてください`);
    if (!s.mixedConcentration) errors.push(`${q.id}: 混合後濃度の逆比導出データがありません`);
    else {
      const m=s.mixedConcentration; const d=gcd(s.lowAmount,s.highAmount);
      if (m.simplifiedAmountRatio[0] !== s.lowAmount/d || m.simplifiedAmountRatio[1] !== s.highAmount/d) errors.push(`${q.id}: 重さの比の約分が不正です`);
      if (m.inverseDistanceRatio[0] !== m.simplifiedAmountRatio[1] || m.inverseDistanceRatio[1] !== m.simplifiedAmountRatio[0]) errors.push(`${q.id}: 濃度の距離が逆比ではありません`);
      if (m.totalConcentrationGap !== s.highConcentration-s.lowConcentration || m.gapUnit*(m.inverseDistanceRatio[0]+m.inverseDistanceRatio[1]) !== m.totalConcentrationGap || s.lowConcentration+m.distanceFromLow !== s.targetConcentration || s.highConcentration-m.distanceFromHigh !== s.targetConcentration) errors.push(`${q.id}: 逆比による中央濃度の導出が不正です`);
    }
  }
  if (q.typeId === 'unknown-amount' && !includesGram(q.question, s.knownWeight?.match(/\d+/)?.[0] ?? '')) errors.push(`${q.id}: 既知側の具体的なg数が問題文にありません`);
  if (['add-water','add-salt','total-amount','evaporation'].includes(q.typeId) && q.answerType !== 'identify') {
    const source = q.typeId === 'evaporation' ? s.sourceAmount : q.typeId === 'add-salt' ? s.lowAmount : (s.highAmount ?? s.lowAmount);
    if (!source || !includesGram(q.question,source)) errors.push(`${q.id}: 元の具体的なg数が問題文にありません`);
  }
  if (q.typeId === 'add-water' || q.typeId === 'total-amount') if (s.lowConcentration !== 0 || !s.lowLabel.includes('水')) errors.push(`${q.id}: 水は0％として登録してください`);
  if (q.typeId === 'add-salt') if (s.highConcentration !== 100 || !s.highLabel.includes('食塩')) errors.push(`${q.id}: 食塩は100％として登録してください`);
  if (q.typeId === 'evaporation') {
    if (s.lowConcentration !== 0 || !s.lowLabel.includes('水')) errors.push(`${q.id}: 蒸発するものは0％の水です`);
    if (s.sourceAmount !== undefined && mix && s.sourceAmount !== mix.lowAmount + mix.highAmount) errors.push(`${q.id}: 蒸発前の重さが水と残った食塩水の合計に一致しません`);
  }
  // 導出前に未知値を構造上隠す。答えを使う計算は answerDerivation にだけ置く。
  if (['target-concentration','high-concentration','high-amount','low-amount','total-amount','amount-ratio'].includes(s.unknownPosition)) {
    if (!s.hiddenValue) errors.push(`${q.id}: 未知値がありません`);
  }
}

function validateSequence(question) {
  const s = question.sequence; if (!s) return errors.push(`${question.id}: 数列データがありません`);
  if (question.choices[question.answerIndex] !== s.validationData.expectedAnswer) errors.push(`${question.id}: 数列の正解が一致しません`);
}

function validateMultiplesDivisors(question) {
  const d=question.multiplesDivisors;
  if (!d) return errors.push(`${question.id}: 倍数と約数データがありません`);
  const allText=[question.question,question.shortRule,question.explanation,question.deepExplanation,question.mistakeReason,...d.readingClues,...(d.ladderSteps ?? [])].join('\n');
  for (const word of banned) if (allText.includes(word)) errors.push(`${question.id}: 禁止するあいまい表現「${word}」があります`);
  if (!d.modeIds?.length) errors.push(`${question.id}: 対象モードがありません`);
  const answer=question.choices[question.answerIndex];
  if (answer !== d.validationData.answerText) errors.push(`${question.id}: 正解選択肢と登録値が一致しません`);
  const values=d.numbers ?? []; const max=d.range?.max;
  let computed;
  switch (question.typeId) {
    case 'common-multiples-count': computed=Math.floor(max / lcm(values)); break;
    case 'divisor-sum': {
      const target=d.divisorTarget; const divisors=Array.from({length:target},(_,i)=>i+1).filter((n)=>target%n===0);
      if (divisors.join(',') !== (d.divisorList ?? []).join(',')) errors.push(`${question.id}: 約数一覧が一致しません`);
      computed=divisors.reduce((sum,n)=>sum+n,0); break;
    }
    case 'same-remainder': computed=question.learningStage === 'blank' ? d.remainder : Array.from({length:max-d.range.min+1},(_,i)=>d.range.min+i).filter((n)=>values.every((v)=>n%v===d.remainder)); break;
    case 'same-shortage': computed=question.learningStage === 'blank' ? d.shortage : Array.from({length:max-d.range.min+1},(_,i)=>d.range.min+i).filter((n)=>values.every((v)=>n%v===v-d.shortage)); break;
    case 'greatest-common-divisor': computed=values.reduce(gcd); break;
    case 'least-common-multiple-remainder': computed=lcm(values)+d.remainder; break;
    case 'multiple-or-count': computed=Math.floor(max/values[0])+Math.floor(max/values[1])-Math.floor(max/lcm(values)); break;
    case 'multiples-identify': return;
    default: errors.push(`${question.id}: 未知の倍数と約数型です`); return;
  }
  const expected=d.validationData.expected;
  const actual=Array.isArray(computed) ? computed.length : computed;
  if (actual !== expected) errors.push(`${question.id}: 内部計算は${actual}ですが正解は${expected}です`);
  if (Array.isArray(computed) && d.validationData.enumerate && computed.join(',') !== d.validationData.enumerate.join(',')) errors.push(`${question.id}: 数え上げ結果が一致しません`);
  if (!question.question.match(/[0-9]/)) errors.push(`${question.id}: 問題文に具体的な数値がありません`);
}

function validateSpeed(question) {
  const s=question.speed;
  if (!s) return errors.push(`${question.id}: 速さデータがありません`);
  const text=[question.question,question.shortRule,question.explanation,question.deepExplanation,question.mistakeReason,...question.steps,...s.readingClues,s.clueReason].join('\n');
  for (const word of banned) if (text.includes(word)) errors.push(`${question.id}: 禁止するあいまい表現「${word}」があります`);
  for (const word of ['明らか','当然']) if (text.includes(word)) errors.push(`${question.id}: 根拠を省略する表現「${word}」があります`);
  if (!s.modeIds.length) errors.push(`${question.id}: 対象モードがありません`);
  if (question.choices[question.answerIndex] !== s.validationData.answerText) errors.push(`${question.id}: 正解選択肢と登録値が一致しません`);
  if (!s.readingClues.length || !s.clueReason) errors.push(`${question.id}: 型判定の合図または理由がありません`);
  if (question.typeId !== 'speed-identify' && question.steps.length < 3) errors.push(`${question.id}: 段階的な手順が不足しています`);
  const v=s.values; const expected=Number(s.validationData.expected); let computed;
  if (question.typeId === 'basic-speed') {
    if (v.speed !== undefined && v.timeMinutes !== undefined && v.distance === undefined) computed=s.validationData.unit==='m/分' ? Number(v.speed)*1000/60 : Number(v.speed)*Number(v.timeMinutes)/60;
    if (v.distance !== undefined && v.timeMinutes !== undefined) computed=s.validationData.unit==='m/分' ? Number(v.distance)/Number(v.timeMinutes) : Number(v.distance)/(Number(v.timeMinutes)/60);
    if (v.distance !== undefined && v.speed !== undefined && v.timeMinutes === undefined) computed=s.validationData.unit==='分' ? (Number(v.distance)<100 ? Number(v.distance)*1000/Number(v.speed) : Number(v.distance)/Number(v.speed)) : Number(v.distance)/Number(v.speed);
  }
  if (question.typeId === 'multi-segment') computed=v.d1 !== undefined ? Number(v.d1)/Number(v.s1)+Number(v.d2)/Number(v.s2) : Number(v.s1)*Number(v.t1)+Number(v.s2)*Number(v.t2);
  if (question.typeId === 'meeting') { const raw=v.distance !== undefined ? Number(v.distance)/(Number(v.a)+Number(v.b)) : (Number(v.a)+Number(v.b))*Number(v.time); computed=s.validationData.unit==='分' && Number(v.distance) < 100 ? raw*60 : raw; }
  if (question.typeId === 'chase') { const lead=Number(v.slow)*Number(v.leadMinutes)/60; const time=lead/(Number(v.fast)-Number(v.slow)); computed=s.validationData.unit==='km' ? Number(v.fast)*time : s.validationData.unit==='分' ? time*60 : time; }
  if (question.typeId === 'circuit') { const relative=v.direction==='反対' ? Number(v.a)+Number(v.b) : Number(v.a)-Number(v.b); computed=Number(v.lap)/relative*(Number(v.lap) < 100 ? 60 : 1); }
  if (question.typeId === 'arrival-time') { const diff=s.validationData.unit==='m' ? Number(v.differenceMinutes) : Number(v.differenceMinutes)/60; const normalTime=Number(v.changed)*diff/(Number(v.changed)-Number(v.normal)); computed=Number(v.normal)*normalTime; }
  if (question.typeId === 'average-speed') { const time=Number(v.distance)/Number(v.go)+Number(v.distance)/Number(v.back); computed=Number(v.distance)*2/time; }
  if (computed !== undefined && Math.abs(computed-expected) > epsilon) errors.push(`${question.id}: 公式による検算は${computed}ですが登録値は${expected}です`);
  if (question.typeId === 'average-speed' && (Number(v.go)+Number(v.back))/2 === expected) errors.push(`${question.id}: 平均の速さが単純平均と同じです。違いを確認できません`);
}

function validateWorkNewton(question) {
  const d=question.workNewton;
  if (!d) return errors.push(`${question.id}: 仕事算・ニュートン算データがありません`);
  if (!d.modeIds.length) errors.push(`${question.id}: 対象モードがありません`);
  if (!d.readingClues.length || !d.clueReason) errors.push(`${question.id}: 型判定の合図または理由がありません`);
  if (question.choices[question.answerIndex] !== d.validationData.answerText) errors.push(`${question.id}: 正解選択肢と登録値が一致しません`);
  if (question.typeId !== 'work-identify' && question.steps.length < 3) errors.push(`${question.id}: 段階的な手順が不足しています`);
  if (question.typeId !== 'work-identify' && question.learningStage !== 'memorize' && !question.question.match(/[0-9□]/)) errors.push(`${question.id}: 問題文に具体的な数値または空欄がありません`);
}

for (const q of questions) {
  for (const key of required) if (q[key] === undefined || q[key] === '' || (Array.isArray(q[key]) && !q[key].length)) errors.push(`${q.id || 'unknown'}: ${key} が空です`);
  if (ids.has(q.id)) errors.push(`${q.id}: ID重複`); ids.add(q.id);
  if (!Array.isArray(q.choices) || q.choices.length !== 4) errors.push(`${q.id}: 選択肢は4つ必要です`);
  if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3) errors.push(`${q.id}: answerIndex範囲外`);
  if (new Set(q.choices).size !== q.choices.length) errors.push(`${q.id}: 選択肢重複`);
  const fingerprint = `${q.question}|${q.choices.join('|')}`; if (fingerprints.has(fingerprint)) errors.push(`${q.id}: 同一問題重複`); fingerprints.add(fingerprint);
  if (q.categoryId === 'saltwater-alligation') validateSaltwater(q);
  if (q.categoryId === 'sequence-patterns') validateSequence(q);
  if (q.categoryId === 'multiples-divisors') validateMultiplesDivisors(q);
  if (q.categoryId === 'speed-patterns') validateSpeed(q);
  if (q.categoryId === 'work-newton-patterns') validateWorkNewton(q);
}

const saltModeCounts = Object.fromEntries(['memorize','blank','identify','substitute','practice'].map((mode) => [mode, saltwaterQuestions.filter((q) => q.saltwater?.modeIds?.includes(mode)).length]));
const expectedModeCounts = { memorize:4, blank:2, identify:8, substitute:4, practice:9 };
for (const [mode,count] of Object.entries(expectedModeCounts)) if (saltModeCounts[mode] !== count) errors.push(`食塩水 ${mode}: ${count}問ではなく${saltModeCounts[mode]}問です`);
if (saltwaterQuestions.length !== 27) errors.push(`食塩水は27問ではなく${saltwaterQuestions.length}問です`);

const multiplesModeCounts = Object.fromEntries(['memorize','blank','identify','substitute','practice'].map((mode) => [mode, multiplesDivisorsQuestions.filter((q) => q.multiplesDivisors?.modeIds.includes(mode)).length]));
const expectedMultiplesModeCounts = { memorize:7, blank:2, identify:8, substitute:3, practice:7 };
for (const [mode,count] of Object.entries(expectedMultiplesModeCounts)) if (multiplesModeCounts[mode] !== count) errors.push(`倍数と約数 ${mode}: ${count}問ではなく${multiplesModeCounts[mode]}問です`);
if (multiplesDivisorsQuestions.length !== 27) errors.push(`倍数と約数は27問ではなく${multiplesDivisorsQuestions.length}問です`);
const speedModeCounts = Object.fromEntries(['memorize','blank','identify','substitute','practice'].map((mode) => [mode, speedQuestions.filter((q) => q.speed?.modeIds.includes(mode)).length]));
const expectedSpeedModeCounts = { memorize:7, blank:2, identify:15, substitute:3, practice:49 };
for (const [mode,count] of Object.entries(expectedSpeedModeCounts)) if (speedModeCounts[mode] !== count) errors.push(`速さ ${mode}: ${count}問ではなく${speedModeCounts[mode]}問です`);
if (speedQuestions.length !== 76) errors.push(`速さは76問ではなく${speedQuestions.length}問です`);
const workNewtonModeCounts = Object.fromEntries(['memorize','blank','identify','substitute','practice'].map((mode) => [mode, workNewtonQuestions.filter((q) => q.workNewton?.modeIds.includes(mode)).length]));
const expectedWorkNewtonModeCounts = { memorize:8, blank:16, identify:16, substitute:8, practice:56 };
for (const [mode,count] of Object.entries(expectedWorkNewtonModeCounts)) if (workNewtonModeCounts[mode] !== count) errors.push(`仕事算・ニュートン算 ${mode}: ${count}問ではなく${workNewtonModeCounts[mode]}問です`);
if (workNewtonQuestions.length !== 104) errors.push(`仕事算・ニュートン算は104問ではなく${workNewtonQuestions.length}問です`);
console.log(`カテゴリ数: ${new Set(questions.map((q) => q.categoryId)).size}`);
console.log(`問題数: ${questions.length}（因数分解 ${factorization.length}問 / 食塩水 ${saltwaterQuestions.length}問 / 数列 ${sequenceQuestions.length}問 / 倍数と約数 ${multiplesDivisorsQuestions.length}問 / 速さ ${speedQuestions.length}問 / 仕事算・ニュートン算 ${workNewtonQuestions.length}問）`);
console.log(`食塩水モード別: ${Object.entries(saltModeCounts).map(([mode,count])=>`${mode} ${count}問`).join(' / ')}`);
console.log(`倍数と約数モード別: ${Object.entries(multiplesModeCounts).map(([mode,count])=>`${mode} ${count}問`).join(' / ')}`);
console.log(`速さモード別: ${Object.entries(speedModeCounts).map(([mode,count])=>`${mode} ${count}問`).join(' / ')}`);
console.log(`仕事算・ニュートン算モード別: ${Object.entries(workNewtonModeCounts).map(([mode,count])=>`${mode} ${count}問`).join(' / ')}`);
if (errors.length) { console.error(`検証エラー\n${errors.join('\n')}`); process.exit(1); }
console.log('検証成功: ID・4択・重複・型別の必須情報・禁止表現・天秤逆比・食塩量保存・モード別問題数を確認しました。');
