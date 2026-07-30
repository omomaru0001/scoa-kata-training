import fs from 'node:fs';
import { saltwaterQuestions } from '../src/data/saltwaterQuestions.ts';
import { sequenceQuestions } from '../src/data/sequenceQuestions.ts';

const factorization = JSON.parse(fs.readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const questions = [...factorization, ...saltwaterQuestions, ...sequenceQuestions];
const required = ['id','categoryId','subcategoryId','typeId','difficulty','learningStage','question','formula','choices','answerIndex','shortRule','triggerWords','steps','explanation','deepExplanation','mistakeReason','diagramType','diagramData','tags'];
const epsilon = 1e-8;
const errors = []; const ids = new Set(); const fingerprints = new Set();
const numeric = (value) => Number(String(value).replace(/[^0-9.]/g, ''));
const includesPercent = (text, value) => text.includes(`${value}％`) || text.includes(`${value}%`);
const includesGram = (text, value) => text.includes(`${value}g`);
const gcd = (a,b) => b ? gcd(b, a % b) : a;
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

for (const q of questions) {
  for (const key of required) if (q[key] === undefined || q[key] === '' || (Array.isArray(q[key]) && !q[key].length)) errors.push(`${q.id || 'unknown'}: ${key} が空です`);
  if (ids.has(q.id)) errors.push(`${q.id}: ID重複`); ids.add(q.id);
  if (!Array.isArray(q.choices) || q.choices.length !== 4) errors.push(`${q.id}: 選択肢は4つ必要です`);
  if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3) errors.push(`${q.id}: answerIndex範囲外`);
  if (new Set(q.choices).size !== q.choices.length) errors.push(`${q.id}: 選択肢重複`);
  const fingerprint = `${q.question}|${q.choices.join('|')}`; if (fingerprints.has(fingerprint)) errors.push(`${q.id}: 同一問題重複`); fingerprints.add(fingerprint);
  if (q.categoryId === 'saltwater-alligation') validateSaltwater(q);
  if (q.categoryId === 'sequence-patterns') validateSequence(q);
}

const saltModeCounts = Object.fromEntries(['memorize','blank','identify','substitute','practice'].map((mode) => [mode, saltwaterQuestions.filter((q) => q.saltwater?.modeIds?.includes(mode)).length]));
const expectedModeCounts = { memorize:4, blank:2, identify:8, substitute:4, practice:9 };
for (const [mode,count] of Object.entries(expectedModeCounts)) if (saltModeCounts[mode] !== count) errors.push(`食塩水 ${mode}: ${count}問ではなく${saltModeCounts[mode]}問です`);
if (saltwaterQuestions.length !== 27) errors.push(`食塩水は27問ではなく${saltwaterQuestions.length}問です`);

console.log(`カテゴリ数: ${new Set(questions.map((q) => q.categoryId)).size}`);
console.log(`問題数: ${questions.length}（因数分解 ${factorization.length}問 / 食塩水 ${saltwaterQuestions.length}問 / 数列 ${sequenceQuestions.length}問）`);
console.log(`食塩水モード別: ${Object.entries(saltModeCounts).map(([mode,count])=>`${mode} ${count}問`).join(' / ')}`);
if (errors.length) { console.error(`検証エラー\n${errors.join('\n')}`); process.exit(1); }
console.log('検証成功: ID・4択・重複・型別の必須情報・禁止表現・天秤逆比・食塩量保存・モード別問題数を確認しました。');
