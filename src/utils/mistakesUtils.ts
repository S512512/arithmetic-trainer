// 错题本管理功能
import { Operator } from './mathUtils';

// 本地存储键名
const MISTAKES_KEY = 'arithmetic_trainer_mistakes';

// 错题记录接口
export interface MistakeRecord {
  id: string; // 唯一标识符
  question: string;
  correctAnswer: number;
  userAnswer: number;
  timestamp: number;
  operators: string[]; // 包含的运算符
  difficulty: number; // 题目难度等级
  attempts: number; // 尝试次数
  lastReviewDate?: number; // 最后一次复习日期
}

/**
 * 保存错题记录
 */
export const addMistake = (
  question: string,
  correctAnswer: number,
  userAnswer: number,
  operators: string[],
  difficulty: number
): void => {
  try {
    const mistakes = getMistakes();
    
    // 生成唯一ID
    const id = `mistake_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // 检查是否已存在相同的问题
    const existingIndex = mistakes.findIndex(m => m.question === question);
    
    if (existingIndex >= 0) {
      // 如果存在，更新记录
      mistakes[existingIndex].attempts++;
      mistakes[existingIndex].userAnswer = userAnswer;
      mistakes[existingIndex].timestamp = Date.now();
    } else {
      // 如果不存在，添加新记录
      mistakes.push({
        id,
        question,
        correctAnswer,
        userAnswer,
        timestamp: Date.now(),
        operators,
        difficulty,
        attempts: 1
      });
    }
    
    // 保存更新后的错题记录
    saveMistakes(mistakes);
  } catch (error) {
    console.error('保存错题记录失败:', error);
  }
};

/**
 * 从错题本中移除指定题目
 */
export const removeMistake = (id: string): void => {
  try {
    const mistakes = getMistakes().filter(mistake => mistake.id !== id);
    saveMistakes(mistakes);
  } catch (error) {
    console.error('删除错题记录失败:', error);
  }
};

/**
 * 更新错题记录（例如完成复习后）
 */
export const updateMistakeReview = (id: string): void => {
  try {
    const mistakes = getMistakes();
    const index = mistakes.findIndex(mistake => mistake.id === id);
    
    if (index >= 0) {
      mistakes[index].lastReviewDate = Date.now();
      saveMistakes(mistakes);
    }
  } catch (error) {
    console.error('更新错题复习状态失败:', error);
  }
};

/**
 * 获取所有错题
 */
export const getMistakes = (): MistakeRecord[] => {
  try {
    const savedMistakes = localStorage.getItem(MISTAKES_KEY);
    
    if (savedMistakes) {
      return JSON.parse(savedMistakes) as MistakeRecord[];
    }
    
    return [];
  } catch (error) {
    console.error('获取错题记录失败:', error);
    return [];
  }
};

/**
 * 保存错题列表到本地存储
 */
const saveMistakes = (mistakes: MistakeRecord[]): void => {
  try {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
  } catch (error) {
    console.error('保存错题列表失败:', error);
  }
};

/**
 * 获取待复习的错题
 * @param count 要获取的错题数量
 * @returns 待复习的错题列表
 */
export const getMistakesToReview = (count: number = 10): MistakeRecord[] => {
  const mistakes = getMistakes();
  
  // 按最近错误和复习日期排序
  return mistakes
    .sort((a, b) => {
      // 优先选择从未复习过的题目
      if (!a.lastReviewDate && b.lastReviewDate) return -1;
      if (a.lastReviewDate && !b.lastReviewDate) return 1;
      
      // 其次按照最后错误时间排序
      return b.timestamp - a.timestamp;
    })
    .slice(0, count);
};

/**
 * 获取按操作符分类的错题统计
 */
export const getMistakeStatsByOperator = (): Record<string, number> => {
  const mistakes = getMistakes();
  const stats: Record<string, number> = {
    [Operator.ADDITION]: 0,
    [Operator.SUBTRACTION]: 0,
    [Operator.MULTIPLICATION]: 0,
    [Operator.DIVISION]: 0
  };
  
  // 累计每个操作符的错题数量
  mistakes.forEach(mistake => {
    mistake.operators.forEach(op => {
      if (stats[op] !== undefined) {
        stats[op]++;
      }
    });
  });
  
  return stats;
}; 