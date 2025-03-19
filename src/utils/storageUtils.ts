import { format } from 'date-fns';

// 本地存储中使用的键名
const PROGRESS_KEY = 'arithmetic_trainer_progress';
const COMPLETION_DATES_KEY = 'arithmetic_trainer_completion_dates';

// 进度数据接口
interface ProgressData {
  date: string; // 日期，格式为'yyyy-MM-dd'
  questions: Array<{
    question: string;
    answer: number;
    userAnswer?: number;
  }>;
  currentIndex: number;
}

/**
 * 保存当前进度到本地存储
 * @param questions 问题列表
 * @param currentIndex 当前问题索引
 */
export const saveProgress = (
  questions: Array<{
    question: string;
    answer: number;
    userAnswer?: number;
  }>,
  currentIndex: number
): void => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const progressData: ProgressData = {
      date: today,
      questions,
      currentIndex
    };
    
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.error('保存进度失败:', error);
  }
};

/**
 * 从本地存储加载进度
 * @returns 进度数据，如果没有则返回null
 */
export const loadProgress = (): ProgressData | null => {
  try {
    const savedProgress = localStorage.getItem(PROGRESS_KEY);
    
    if (savedProgress) {
      return JSON.parse(savedProgress) as ProgressData;
    }
    
    return null;
  } catch (error) {
    console.error('加载进度失败:', error);
    return null;
  }
};

/**
 * 保存完成日期到本地存储
 * @param date 完成日期，格式为'yyyy-MM-dd'
 */
export const saveCompletionDate = (date: string): void => {
  try {
    const savedDates = getCompletionDates();
    
    // 检查日期是否已存在，避免重复添加
    if (!savedDates.includes(date)) {
      savedDates.push(date);
      localStorage.setItem(COMPLETION_DATES_KEY, JSON.stringify(savedDates));
    }
  } catch (error) {
    console.error('保存完成日期失败:', error);
  }
};

/**
 * 获取所有完成日期
 * @returns 完成日期数组
 */
export const getCompletionDates = (): string[] => {
  try {
    const savedDates = localStorage.getItem(COMPLETION_DATES_KEY);
    
    if (savedDates) {
      return JSON.parse(savedDates) as string[];
    }
    
    return [];
  } catch (error) {
    console.error('获取完成日期失败:', error);
    return [];
  }
}; 