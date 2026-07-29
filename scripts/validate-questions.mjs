import fs from 'node:fs';
import { saltwaterQuestions } from '../src/data/saltwaterQuestions.ts';

const factorization = JSON.parse(fs.readFileSync(new URL('../src/data/questions.json', import.meta.url), 'utf8'));
const questions = [...factorization, ...saltwaterQuestions];
const required = ['id','categoryId','subcategoryId','typeId','difficulty','learningStage','question','formula','choices','answerIndex','shortRule','triggerWords','steps','explanation','deepExplanation','mistakeReason','diagramType','diagramData','tags'];
const factorExpected = {
  'factor-basic-001':'(x＋a)(x＋b)','factor-basic-002':'(x＋2)(x＋3)','factor-plus-001':'(x＋a)²','factor-plus-002':'プラスの完全平方',
  'factor-minus-001':'x²－2ax＋a²','factor-minus-002':'－','factor-diff-001':'(x＋a)(x－a)','factor-diff-002':'(x＋6)(x－6)',
};
const epsilon = 1e-8;
const numberIn = (value) => Number(String(value).replace(/[^0-9.]/g, ''));
let errors = []; const ids = new Set(); const fingerprints = new Set();

function validateSaltwater(question) {
  const s = question.saltwater;
  if (!s) return errors.push(`${question.id}: 食塩水データがありません`);
  if (!(s.lowConcentration < s.targetConcentration && s.targetConcentration < s.highConcentration)) errors.push(`${question.id}: 低い＜目標＜高い ではありません`);
  if (s.leftDifference !== s.targetConcentration - s.lowConcentration || s.rightDifference !== s.highConcentration - s.targetConcentration) errors.push(`${question.id}: 濃度差が正しくありません`);
  if ((question.typeId === 'add-water' || question.typeId === 'alligation-identify') && (s.lowConcentration !== 0 || !s.lowLabel.includes('水'))) errors.push(`${question.id}: 水は0％として登録してください`);
  if (question.typeId === 'add-salt' && (s.highConcentration !== 100 || !s.highLabel.includes('食塩'))) errors.push(`${question.id}: 食塩は100％として登録してください`);
  if (question.typeId === 'evaporation' && (s.lowConcentration !== 0 || !s.lowLabel.includes('水'))) errors.push(`${question.id}: 蒸発する水は0％として登録してください`);
  const mix = s.validationData.mix;
  if (mix) {
    const computed = (s.lowConcentration * mix.lowAmount + s.highConcentration * mix.highAmount) / (mix.lowAmount + mix.highAmount);
    if (Math.abs(computed - s.targetConcentration) > epsilon) errors.push(`${question.id}: 食塩量保存の濃度検算に失敗 (${computed})`);
    const ratioFromAmounts = mix.lowAmount / mix.highAmount;
    const ratioFromDifferences = s.rightDifference / s.leftDifference;
    if (Math.abs(ratioFromAmounts - ratioFromDifferences) > epsilon) errors.push(`${question.id}: 差と反対側の重さの比が一致しません`);
  }
  const answer = question.choices[question.answerIndex];
  if (s.validationData.answerText && answer !== s.validationData.answerText) errors.push(`${question.id}: 選択肢の正解と登録した答えが一致しません`);
  if (s.answerType === 'ratio' && answer !== s.amountRatio) errors.push(`${question.id}: 比の正解がamountRatioと一致しません`);
  if (s.answerType === 'concentration' || s.answerType === 'amount') {
    if (Math.abs(numberIn(answer) - s.validationData.expected) > epsilon) errors.push(`${question.id}: 選択肢の正解と内部計算結果が一致しません`);
    if (s.validationData.unit === '%' && !answer.includes('％')) errors.push(`${question.id}: 濃度の単位が一致しません`);
    if (s.validationData.unit === 'g' && !answer.includes('g')) errors.push(`${question.id}: 重さの単位が一致しません`);
  }
}

for (const question of questions) {
  for (const key of required) if (question[key] === undefined || question[key] === '' || (Array.isArray(question[key]) && !question[key].length)) errors.push(`${question.id || 'unknown'}: ${key} が空です`);
  if (ids.has(question.id)) errors.push(`${question.id}: ID重複`); ids.add(question.id);
  if (!Array.isArray(question.choices) || question.choices.length !== 4) errors.push(`${question.id}: 選択肢は4つ必要です`);
  if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex > 3) errors.push(`${question.id}: answerIndex範囲外`);
  if (!question.choices?.[question.answerIndex]) errors.push(`${question.id}: 正解選択肢なし`);
  if (new Set(question.choices).size !== question.choices.length) errors.push(`${question.id}: 選択肢重複`);
  const fingerprint = `${question.question}|${question.choices.join('|')}`; if (fingerprints.has(fingerprint)) errors.push(`${question.id}: 同一問題重複`); fingerprints.add(fingerprint);
  if (question.categoryId === 'factorization') { if (!question.formula.includes('＝')) errors.push(`${question.id}: 公式の形式不正`); if (factorExpected[question.id] !== question.choices?.[question.answerIndex]) errors.push(`${question.id}: 公式・数式の正解照合に失敗`); }
  if (question.categoryId === 'saltwater-alligation') validateSaltwater(question);
}
console.log(`カテゴリ数: ${new Set(questions.map((q) => q.categoryId)).size}`);
console.log(`問題数: ${questions.length}（因数分解 ${factorization.length}問 / 食塩水 ${saltwaterQuestions.length}問）`);
if (errors.length) { console.error(`検証エラー\n${errors.join('\n')}`); process.exit(1); }
console.log('検証成功: ID・必須項目・4択・重複・公式整合性・天秤差・反対側比・食塩量保存を確認しました。');
