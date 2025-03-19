// 用户设置和难度管理
import { Operator } from './mathUtils';

// 本地存储键名
const USER_SETTINGS_KEY = 'arithmetic_trainer_settings';
const USER_STATS_KEY = 'arithmetic_trainer_stats';

// 难度级别
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  ADAPTIVE = 'adaptive'
}

// 用户设置接口
export interface UserSettings {
  difficulty: DifficultyLevel;
  questionsPerDay: number;
  theme: string;
  sound: boolean;
  username: string;
}

// 用户统计数据接口
export interface UserStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimePerQuestion: number; // 毫秒
  streakDays: number;
  lastTrainingDate: string;
  performanceByOperator: {
    [key: string]: { correct: number, total: number }
  };
  // 历史记录 - 存储最近30天的表现
  history: Array<{
    date: string;
    correctAnswers: number;
    totalQuestions: number;
    averageTime: number;
  }>;
}

// 默认用户设置
const defaultSettings: UserSettings = {
  difficulty: DifficultyLevel.MEDIUM,
  questionsPerDay: 100,
  theme: 'default',
  sound: true,
  username: '训练者'
};

// 默认用户统计
const defaultStats: UserStats = {
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  averageTimePerQuestion: 0,
  streakDays: 0,
  lastTrainingDate: '',
  performanceByOperator: {
    '+': { correct: 0, total: 0 },
    '-': { correct: 0, total: 0 },
    '*': { correct: 0, total: 0 },
    '/': { correct: 0, total: 0 }
  },
  history: []
};

/**
 * 保存用户设置
 */
export const saveUserSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存用户设置失败:', error);
  }
};

/**
 * 获取用户设置
 */
export const getUserSettings = (): UserSettings => {
  try {
    const savedSettings = localStorage.getItem(USER_SETTINGS_KEY);
    
    if (savedSettings) {
      return JSON.parse(savedSettings) as UserSettings;
    }
    
    // 如果没有保存的设置，使用默认设置并保存
    saveUserSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('读取用户设置失败:', error);
    return defaultSettings;
  }
};

/**
 * 保存用户统计数据
 */
export const saveUserStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('保存用户统计数据失败:', error);
  }
};

/**
 * 获取用户统计数据
 */
export const getUserStats = (): UserStats => {
  try {
    const savedStats = localStorage.getItem(USER_STATS_KEY);
    
    if (savedStats) {
      return JSON.parse(savedStats) as UserStats;
    }
    
    // 如果没有保存的统计数据，使用默认数据并保存
    saveUserStats(defaultStats);
    return defaultStats;
  } catch (error) {
    console.error('读取用户统计数据失败:', error);
    return defaultStats;
  }
};

/**
 * 根据难度级别获取题目参数
 */
export const getDifficultySettings = (level: DifficultyLevel): { maxNumber: number, minOperators: number } => {
  switch (level) {
    case DifficultyLevel.EASY:
      return { maxNumber: 100, minOperators: 2 };
    case DifficultyLevel.MEDIUM:
      return { maxNumber: 500, minOperators: 2 };
    case DifficultyLevel.HARD:
      return { maxNumber: 1000, minOperators: 3 };
    case DifficultyLevel.ADAPTIVE:
      // 自适应难度将根据用户统计数据动态计算
      const stats = getUserStats();
      const correctRate = stats.totalQuestionsAnswered > 0 
        ? stats.correctAnswers / stats.totalQuestionsAnswered 
        : 0.5;
      
      // 根据正确率调整难度
      if (correctRate > 0.9) {
        return { maxNumber: 1000, minOperators: 3 }; // 难
      } else if (correctRate > 0.7) {
        return { maxNumber: 500, minOperators: 2 }; // 中
      } else {
        return { maxNumber: 100, minOperators: 2 }; // 易
      }
    default:
      return { maxNumber: 500, minOperators: 2 };
  }
};

/**
 * 更新用户训练统计数据
 */
export const updateUserStats = (
  isCorrect: boolean, 
  timeSpent: number, 
  operators: string[]
): void => {
  const stats = getUserStats();
  const today = new Date().toISOString().split('T')[0];
  
  // 更新基本统计
  stats.totalQuestionsAnswered++;
  if (isCorrect) {
    stats.correctAnswers++;
  } else {
    stats.incorrectAnswers++;
  }
  
  // 更新平均时间
  const totalTime = stats.averageTimePerQuestion * (stats.totalQuestionsAnswered - 1) + timeSpent;
  stats.averageTimePerQuestion = totalTime / stats.totalQuestionsAnswered;
  
  // 更新运算符表现
  operators.forEach(op => {
    if (stats.performanceByOperator[op]) {
      stats.performanceByOperator[op].total++;
      if (isCorrect) {
        stats.performanceByOperator[op].correct++;
      }
    }
  });
  
  // 更新历史记录
  let todayRecord = stats.history.find(record => record.date === today);
  if (todayRecord) {
    todayRecord.totalQuestions++;
    if (isCorrect) {
      todayRecord.correctAnswers++;
    }
    // 更新平均时间
    const totalTime = todayRecord.averageTime * (todayRecord.totalQuestions - 1) + timeSpent;
    todayRecord.averageTime = totalTime / todayRecord.totalQuestions;
  } else {
    stats.history.push({
      date: today,
      correctAnswers: isCorrect ? 1 : 0,
      totalQuestions: 1,
      averageTime: timeSpent
    });
    
    // 如果历史记录超过30条，删除最旧的记录
    if (stats.history.length > 30) {
      stats.history.sort((a, b) => a.date.localeCompare(b.date));
      stats.history = stats.history.slice(-30);
    }
  }
  
  // 更新连续天数
  if (stats.lastTrainingDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    if (stats.lastTrainingDate === yesterdayString) {
      // 如果上次训练是昨天，连续天数+1
      stats.streakDays++;
    } else if (stats.lastTrainingDate !== today) {
      // 如果上次训练不是昨天也不是今天，重置连续天数
      stats.streakDays = 1;
    }
    
    stats.lastTrainingDate = today;
  }
  
  // 保存更新后的统计数据
  saveUserStats(stats);
}; 