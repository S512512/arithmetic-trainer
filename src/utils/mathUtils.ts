// 操作符枚举
export enum Operator {
  ADDITION = '+',
  SUBTRACTION = '-',
  MULTIPLICATION = '*',
  DIVISION = '/'
}

// 题目接口
interface Question {
  questionText: string;
  correctAnswer: number;
}

// 表达式类型枚举（控制生成哪种结构的复合表达式）
enum ExpressionType {
  // (a OP1 b) OP2 c
  TYPE_1 = 'TYPE_1',
  // a OP1 (b OP2 c)
  TYPE_2 = 'TYPE_2',
  // a OP1 b OP2 c（按照四则运算顺序）
  TYPE_3 = 'TYPE_3'
}

// 生成指定范围内的随机整数
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 生成随机操作符（加减乘除）
const getRandomOperator = (): Operator => {
  const operators = [
    Operator.ADDITION,
    Operator.SUBTRACTION,
    Operator.MULTIPLICATION,
    Operator.DIVISION
  ];
  return operators[Math.floor(Math.random() * operators.length)];
};

// 生成两个不同的随机操作符
const getTwoRandomOperators = (): [Operator, Operator] => {
  const firstOperator = getRandomOperator();
  let secondOperator = getRandomOperator();
  
  // 确保两个操作符不相同
  while (secondOperator === firstOperator) {
    secondOperator = getRandomOperator();
  }
  
  return [firstOperator, secondOperator];
};

// 获取随机表达式类型
const getRandomExpressionType = (): ExpressionType => {
  const types = [
    ExpressionType.TYPE_1,
    ExpressionType.TYPE_2,
    ExpressionType.TYPE_3
  ];
  return types[Math.floor(Math.random() * types.length)];
};

// 针对不同操作符生成适合的随机数，确保结果在合理范围内
const generateNumberForOperator = (operator: Operator, isFirstNumber: boolean, maxNumber: number = 1000): number => {
  switch (operator) {
    case Operator.ADDITION:
    case Operator.SUBTRACTION:
      // 加减法：数字在合理范围内
      return getRandomInt(1, maxNumber / 3);
      
    case Operator.MULTIPLICATION:
      // 乘法：较小的乘数
      return getRandomInt(1, 20);
      
    case Operator.DIVISION:
      if (isFirstNumber) {
        // 除法：被除数（确保较大）
        return getRandomInt(10, 200);
      } else {
        // 除法：除数（确保较小且不为0）
        return getRandomInt(2, 10);
      }
      
    default:
      return 1;
  }
};

// 计算给定操作符和数字的结果
const calculateResult = (num1: number, num2: number, operator: Operator): number => {
  switch (operator) {
    case Operator.ADDITION:
      return num1 + num2;
    case Operator.SUBTRACTION:
      return num1 - num2;
    case Operator.MULTIPLICATION:
      return num1 * num2;
    case Operator.DIVISION:
      return Math.floor(num1 / num2); // 确保除法结果为整数
    default:
      return 0;
  }
};

// 获取操作符的显示字符
const getDisplayOperator = (operator: Operator): string => {
  switch (operator) {
    case Operator.ADDITION:
      return '+';
    case Operator.SUBTRACTION:
      return '-';
    case Operator.MULTIPLICATION:
      return '×';
    case Operator.DIVISION:
      return '÷';
    default:
      return '';
  }
};

// 生成复合运算的口算题目（包含至少两种运算）
export const generateQuestion = (maxNumber: number = 1000): Question => {
  // 获取两个不同的随机操作符
  const [operator1, operator2] = getTwoRandomOperators();
  
  // 获取随机表达式类型
  const expressionType = getRandomExpressionType();
  
  // 生成三个随机数
  const num1 = generateNumberForOperator(operator1, true, maxNumber);
  const num2 = generateNumberForOperator(operator1, false, maxNumber);
  const num3 = generateNumberForOperator(operator2, false, maxNumber);
  
  // 显示用的操作符符号
  const displayOp1 = getDisplayOperator(operator1);
  const displayOp2 = getDisplayOperator(operator2);
  
  // 计算正确答案并生成题目文本
  let correctAnswer: number;
  let questionText: string;
  
  switch (expressionType) {
    case ExpressionType.TYPE_1:
      // (a OP1 b) OP2 c
      const subResult1 = calculateResult(num1, num2, operator1);
      correctAnswer = calculateResult(subResult1, num3, operator2);
      questionText = `(${num1} ${displayOp1} ${num2}) ${displayOp2} ${num3} = ?`;
      break;
      
    case ExpressionType.TYPE_2:
      // a OP1 (b OP2 c)
      const subResult2 = calculateResult(num2, num3, operator2);
      correctAnswer = calculateResult(num1, subResult2, operator1);
      questionText = `${num1} ${displayOp1} (${num2} ${displayOp2} ${num3}) = ?`;
      break;
      
    case ExpressionType.TYPE_3:
      // a OP1 b OP2 c（按照四则运算顺序）
      // 如果第一个是乘除，第二个是加减，那么先算乘除
      if ((operator1 === Operator.MULTIPLICATION || operator1 === Operator.DIVISION) && 
          (operator2 === Operator.ADDITION || operator2 === Operator.SUBTRACTION)) {
        const subResult = calculateResult(num1, num2, operator1);
        correctAnswer = calculateResult(subResult, num3, operator2);
        questionText = `${num1} ${displayOp1} ${num2} ${displayOp2} ${num3} = ?`;
      }
      // 如果第一个是加减，第二个是乘除，那么先算乘除
      else if ((operator1 === Operator.ADDITION || operator1 === Operator.SUBTRACTION) && 
               (operator2 === Operator.MULTIPLICATION || operator2 === Operator.DIVISION)) {
        const subResult = calculateResult(num2, num3, operator2);
        correctAnswer = calculateResult(num1, subResult, operator1);
        questionText = `${num1} ${displayOp1} ${num2} ${displayOp2} ${num3} = ?`;
      }
      // 如果两个运算符优先级相同，那么从左到右计算
      else {
        const subResult = calculateResult(num1, num2, operator1);
        correctAnswer = calculateResult(subResult, num3, operator2);
        questionText = `${num1} ${displayOp1} ${num2} ${displayOp2} ${num3} = ?`;
      }
      break;
      
    default:
      correctAnswer = 0;
      questionText = '';
  }
  
  // 重新生成题目，如果答案不在合理范围内
  if (correctAnswer <= 0 || correctAnswer > maxNumber || !Number.isInteger(correctAnswer)) {
    return generateQuestion(maxNumber);
  }
  
  return {
    questionText,
    correctAnswer
  };
};

// 检查用户答案是否正确
export const isAnswerCorrect = (userAnswer: number, correctAnswer: number): boolean => {
  return Math.abs(userAnswer - correctAnswer) < 0.001; // 考虑浮点数精度问题
};

// 分解一个题目中使用的所有操作符
export const getOperatorsFromQuestion = (questionText: string): string[] => {
  const operators = ['+', '-', '×', '÷'];
  return operators.filter(op => questionText.includes(op));
};

// 根据难度生成题目
export const generateQuestionByDifficulty = (
  difficulty: number, 
  minOperators: number = 2
): Question => {
  let maxNumber = 100;
  let operatorsCount = minOperators;
  
  // 根据难度调整参数
  if (difficulty >= 7) {
    maxNumber = 1000;
    operatorsCount = Math.max(3, minOperators);
  } else if (difficulty >= 4) {
    maxNumber = 500;
    operatorsCount = Math.max(2, minOperators);
  } else {
    maxNumber = 100;
    operatorsCount = minOperators;
  }
  
  // 生成2个操作符的标准题目
  if (operatorsCount <= 2) {
    return generateQuestion(maxNumber);
  }
  
  // 生成3个或更多操作符的复杂题目
  return generateComplexQuestion(operatorsCount, maxNumber);
};

// 生成三个或更多操作符的复杂题目
const generateComplexQuestion = (operatorsCount: number, maxNumber: number): Question => {
  // 生成操作符
  const operators: Operator[] = [];
  for (let i = 0; i < operatorsCount; i++) {
    let op = getRandomOperator();
    // 避免连续相同的运算符
    while (i > 0 && op === operators[i - 1]) {
      op = getRandomOperator();
    }
    operators.push(op);
  }
  
  // 生成操作数（比操作符多1个）
  const numbers: number[] = [];
  for (let i = 0; i < operatorsCount + 1; i++) {
    let num: number;
    
    if (i === 0) {
      // 第一个数
      num = generateNumberForOperator(operators[0], true, maxNumber);
    } else if (i === operatorsCount) {
      // 最后一个数
      num = generateNumberForOperator(operators[i - 1], false, maxNumber);
    } else {
      // 中间的数，考虑前后两个操作符
      const prevOp = operators[i - 1];
      const nextOp = operators[i];
      
      if ((prevOp === Operator.DIVISION || prevOp === Operator.MULTIPLICATION) && 
          (nextOp === Operator.ADDITION || nextOp === Operator.SUBTRACTION)) {
        // 如果前一个是乘除，后一个是加减，优先考虑前一个的约束
        num = generateNumberForOperator(prevOp, false, maxNumber);
      } else {
        // 其他情况，生成适合两边操作符的数
        const num1 = generateNumberForOperator(prevOp, false, maxNumber);
        const num2 = generateNumberForOperator(nextOp, true, maxNumber);
        num = Math.min(num1, num2);
      }
    }
    
    numbers.push(num);
  }
  
  // 创建带括号的表达式或按照运算优先级计算
  // 随机决定是否添加括号
  const useBrackets = Math.random() > 0.5;
  
  let questionText = '';
  let correctAnswer = 0;
  
  if (useBrackets && operatorsCount >= 3) {
    // 随机决定括号位置
    const bracketStart = Math.floor(Math.random() * (operatorsCount - 1));
    const bracketEnd = bracketStart + 1 + Math.floor(Math.random() * (operatorsCount - bracketStart - 1));
    
    // 构建题目文本
    let expressionParts = [];
    for (let i = 0; i < numbers.length; i++) {
      if (i === bracketStart) {
        expressionParts.push(`(${numbers[i]}`);
      } else if (i === bracketEnd) {
        expressionParts.push(`${numbers[i]})`);
      } else {
        expressionParts.push(`${numbers[i]}`);
      }
      
      if (i < operators.length) {
        expressionParts.push(getDisplayOperator(operators[i]));
      }
    }
    
    questionText = expressionParts.join(' ') + ' = ?';
    
    // 计算答案（模拟带括号的计算过程）
    // 先计算括号内的结果
    let bracketResult = numbers[bracketStart];
    for (let i = bracketStart; i < bracketEnd; i++) {
      bracketResult = calculateResult(bracketResult, numbers[i + 1], operators[i]);
    }
    
    // 替换括号内的数字和操作符
    let newNumbers = [...numbers];
    newNumbers.splice(bracketStart, bracketEnd - bracketStart + 1, bracketResult);
    
    let newOperators = [...operators];
    newOperators.splice(bracketStart, bracketEnd - bracketStart);
    
    // 按照四则运算顺序计算
    correctAnswer = calculateExpressionWithPrecedence(newNumbers, newOperators);
  } else {
    // 不使用括号，按照标准四则运算顺序
    // 构建题目文本
    let expressionParts = [];
    for (let i = 0; i < numbers.length; i++) {
      expressionParts.push(`${numbers[i]}`);
      if (i < operators.length) {
        expressionParts.push(getDisplayOperator(operators[i]));
      }
    }
    
    questionText = expressionParts.join(' ') + ' = ?';
    
    // 按照四则运算顺序计算
    correctAnswer = calculateExpressionWithPrecedence(numbers, operators);
  }
  
  // 如果答案不是整数或超出范围，递归重新生成
  if (!Number.isInteger(correctAnswer) || correctAnswer <= 0 || correctAnswer > maxNumber) {
    return generateComplexQuestion(operatorsCount, maxNumber);
  }
  
  return {
    questionText,
    correctAnswer
  };
};

// 按照四则运算顺序计算表达式
const calculateExpressionWithPrecedence = (numbers: number[], operators: Operator[]): number => {
  // 复制数组，避免修改原始数组
  const nums = [...numbers];
  const ops = [...operators];
  
  // 第一轮：计算所有乘法和除法
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === Operator.MULTIPLICATION || ops[i] === Operator.DIVISION) {
      const result = calculateResult(nums[i], nums[i + 1], ops[i]);
      nums[i] = result;
      nums.splice(i + 1, 1);
      ops.splice(i, 1);
      i--; // 回退一步，因为数组长度变了
    }
  }
  
  // 第二轮：从左到右计算所有加法和减法
  let result = nums[0];
  for (let i = 0; i < ops.length; i++) {
    result = calculateResult(result, nums[i + 1], ops[i]);
  }
  
  return result;
}; 