export type FormulaId = 'basic' | 'square-plus' | 'square-minus' | 'difference-squares';
export type SaltwaterType = 'placement' | 'difference-cross' | 'ratio' | 'mixed-concentration' | 'unknown-amount' | 'add-water' | 'add-salt' | 'evaporation' | 'unknown-concentration' | 'alligation-identify' | 'total-amount';
export type SequenceType = 'constant-difference'|'constant-ratio'|'growing-difference'|'alternating'|'fibonacci'|'famous-sequence'|'changing-multiplier'|'difference-pattern'|'sequence-identify';
export type MultiplesDivisorsType = 'common-multiples-count'|'divisor-sum'|'same-remainder'|'same-shortage'|'greatest-common-divisor'|'least-common-multiple-remainder'|'multiple-or-count'|'multiples-identify';
export type SpeedType = 'basic-speed'|'multi-segment'|'meeting'|'chase'|'circuit'|'arrival-time'|'average-speed'|'speed-identify';
export type WorkNewtonType = 'work-basic'|'work-reverse'|'work-switch'|'work-complex'|'work-ratio'|'tank'|'newton-basic'|'newton-advanced'|'work-identify';
export type LearningStage = 'memorize' | 'forward' | 'reverse' | 'blank' | 'symbol' | 'identify' | 'substitute' | 'compare' | 'place' | 'difference' | 'cross' | 'ratio' | 'apply';
export type SaltwaterData = {
  problemPattern:string; questionIntent:string; lowConcentration:number; targetConcentration:number; highConcentration:number;
  lowAmount?:number; highAmount?:number; leftDifference:number; rightDifference:number; amountRatio:string;
  lowLabel:string; targetLabel:string; highLabel:string; knownWeight?:string; unknownPosition?:string;
  shortRule?:string;
  sourceAmount?:number;
  givenInformation?: { lowConcentration:boolean; targetConcentration:boolean; highConcentration:boolean; lowAmount?:boolean; targetAmount?:boolean; highAmount?:boolean; amountRatio?:boolean; };
  readingClues:string[]; characterTip:string; answerType:'concentration'|'amount'|'ratio'|'identify';
  validationData:{ expected:number; unit:'%'|'g'|'ratio'|'yes-no'; answerText?:string; mix?:{lowAmount:number;highAmount:number}; };
  finalConcentration?:number; diagramMode?:'placement'|'difference'|'cross'|'ratio'|'water'|'salt'|'evaporation';
  hiddenValue?:string; derivationSteps?:string[]; diagramBeforeAnswer?:boolean; diagramAfterAnswer?:boolean;
  mixedConcentration?: { simplifiedAmountRatio:[number,number]; inverseDistanceRatio:[number,number]; totalConcentrationGap:number; gapUnit:number; distanceFromLow:number; distanceFromHigh:number; derivedTargetConcentration:number; };
  /** 食塩水だけの明示的なモード分離。 */
  modeIds?: ('memorize'|'blank'|'identify'|'substitute'|'practice')[];
  knownFacts?: string[];
  answerDerivation?: string[];
  saltCheck?: string[];
};
export type SequenceData = { problemPattern:string; sequenceValues:(number|null)[]; blankIndexes:number[]; operationPattern:string[]; differences?:number[]; ratios?:string[]; nextValues:number[]; readingOrder:string; diagramMode:'difference'|'ratio'|'growing-difference'|'alternating'|'fibonacci'|'famous'|'changing-multiplier'|'difference-pattern'|'identify'; validationData:{mode:SequenceType; expectedAnswer:string}; characterTip:string; };
export type MultiplesDivisorsData = {
  problemPattern:string; questionIntent:string; readingClues:string[]; characterTip:string;
  modeIds:('memorize'|'blank'|'identify'|'substitute'|'practice')[];
  diagramMode:'ladder-lcm'|'ladder-gcd'|'divisors'|'remainder'|'shortage'|'inclusion'|'identify';
  numbers?:number[]; range?:{ min:number; max:number }; remainder?:number; shortage?:number;
  divisorTarget?:number; divisorList?:number[]; ladderSteps?:string[];
  validationData:{ expected:number; answerText:string; enumerate?:number[]; };
};
export type SpeedData = {
  problemPattern:string; questionIntent:string; readingClues:string[]; clueReason:string; characterTip:string;
  modeIds:('memorize'|'blank'|'identify'|'substitute'|'practice')[];
  diagramMode:'basic'|'segments'|'meeting'|'chase'|'circuit'|'arrival'|'average'|'identify';
  knownFacts:string[]; values:Record<string,number|string>; validationData:{ kind:SpeedType; expected:number|string; answerText:string; unit:string; };
};
export type WorkNewtonData = {
  problemPattern:string; questionIntent:string; readingClues:string[]; clueReason:string; characterTip:string;
  modeIds:('memorize'|'blank'|'identify'|'substitute'|'practice')[];
  diagramMode:'lcm'|'switch'|'ratio'|'tank'|'queue'|'identify';
  knownFacts:string[]; values:Record<string,number|string>;
  validationData:{ kind:WorkNewtonType; expected:string; answerText:string; };
};
export type Question = { id:string; categoryId:string; subcategoryId:string; typeId:FormulaId|SaltwaterType|SequenceType|MultiplesDivisorsType|SpeedType|WorkNewtonType; difficulty:'basic'; learningStage:LearningStage; question:string; formula:string; choices:string[]; answerIndex:number; shortRule:string; triggerWords:string[]; steps:string[]; explanation:string; deepExplanation:string; mistakeReason:string; diagramType:'sum-product-pair'|'square-tiles'|'difference-squares'|'saltwater-alligation'|'sequence-pattern'|'multiples-divisors'|'speed'|'work-newton'; diagramData:Record<string,string>; tags:string[]; saltwater?:SaltwaterData; sequence?:SequenceData; multiplesDivisors?:MultiplesDivisorsData; speed?:SpeedData; workNewton?:WorkNewtonData };
export type Formula = {id:FormulaId; name:string; formula:string; rule:string; lookFor:string; example:string; diagramType:Question['diagramType']};
