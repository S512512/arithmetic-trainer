import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { format } from 'date-fns';
import Question from './components/Question';
import Calendar from './components/Calendar';
import StatsView from './components/StatsView';
import MistakesView from './components/MistakesView';
import SettingsView from './components/SettingsView';
import { generateQuestion, generateQuestionByDifficulty, isAnswerCorrect, getOperatorsFromQuestion } from './utils/mathUtils';
import { saveProgress, loadProgress, saveCompletionDate, getCompletionDates } from './utils/storageUtils';
import { getUserSettings, updateUserStats, getDifficultySettings, getUserStats } from './utils/userSettings';
import { addMistake } from './utils/mistakesUtils';

// 主题定义
const themes = {
  default: {
    primary: '#5c6bc0',
    secondary: '#66bb6a',
    background: '#f5f9ff',
    text: '#333333',
    accent: '#ff7043',
    header: 'linear-gradient(135deg, #7e57c2, #5c6bc0)',
    card: '#ffffff',
    shadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
  },
  dark: {
    primary: '#5c6bc0',
    secondary: '#66bb6a',
    background: '#121212',
    text: '#e0e0e0',
    accent: '#ff7043',
    header: 'linear-gradient(135deg, #4527a0, #303f9f)',
    card: '#1e1e1e',
    shadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
  },
  colorful: {
    primary: '#ff4081',
    secondary: '#00bcd4',
    background: '#f5fffd',
    text: '#37474f',
    accent: '#ffc107',
    header: 'linear-gradient(135deg, #ff4081, #00bcd4)',
    card: '#ffffff',
    shadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
  }
};

// 全局样式
const GlobalStyle = createGlobalStyle<{ theme: any }>`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: all 0.3s ease;
  }
`;

// 样式组件
const AppContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Comic Sans MS', Arial, sans-serif;
`;

const Header = styled.header<{ theme: any }>`
  text-align: center;
  margin-bottom: 30px;
  background: ${props => props.theme.header};
  padding: 20px;
  border-radius: 20px;
  box-shadow: ${props => props.theme.shadow};
  border: 2px dashed rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const Progress = styled.div<{ theme: any }>`
  font-size: 18px;
  margin: 10px 0;
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
  font-weight: bold;
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: 30px;
  animation: fadeIn 0.5s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const StartButton = styled.button<{ theme: any }>`
  background-color: ${props => props.theme.secondary};
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 50px;
  margin: 20px auto;
  display: block;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
`;

const CompletionMessage = styled.div<{ theme: any }>`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 20px;
  border-radius: 20px;
  text-align: center;
  font-size: 22px;
  margin: 20px 0;
  border: 2px solid #a5d6a7;
  box-shadow: ${props => props.theme.shadow};
  animation: confetti 0.5s ease-in;

  @keyframes confetti {
    0% { transform: translateY(-20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;

const IntroText = styled.p<{ theme: any }>`
  font-size: 18px;
  line-height: 1.6;
  background-color: ${props => props.theme.card};
  padding: 20px;
  border-radius: 20px;
  box-shadow: ${props => props.theme.shadow};
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  border-radius: 50px;
`;

const NavButton = styled.button<{ active: boolean; theme: any }>`
  background-color: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? props.theme.primary : 'white'};
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 50px;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const ShareButton = styled.button<{ theme: any }>`
  background-color: ${props => props.theme.accent};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  margin-top: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: scale(1.05);
  }
`;

enum AppView {
  TRAINING = 'training',
  STATS = 'stats',
  MISTAKES = 'mistakes',
  SETTINGS = 'settings'
}

const App: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Array<{
    question: string;
    answer: number;
    userAnswer?: number;
    operators?: string[];
    startTime?: number;
    endTime?: number;
  }>>([]);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completionDates, setCompletionDates] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.TRAINING);
  const [currentTheme, setCurrentTheme] = useState('default');
  const userSettings = useRef(getUserSettings());
  const answerTimeStart = useRef<number>(0);
  const today = format(new Date(), 'yyyy-MM-dd');

  // 监听用户设置变更
  useEffect(() => {
    const checkSettings = () => {
      const settings = getUserSettings();
      userSettings.current = settings;
      setCurrentTheme(settings.theme);
    };
    
    // 初始检查
    checkSettings();
    
    // 每5秒检查一次，以防在其他标签页中修改了设置
    const interval = setInterval(checkSettings, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 加载保存的进度和完成日期
  useEffect(() => {
    const savedProgress = loadProgress();
    const savedCompletionDates = getCompletionDates();
    
    if (savedProgress && savedProgress.date === today) {
      setQuestions(savedProgress.questions);
      setCurrentQuestionIndex(savedProgress.currentIndex);
      setIsStarted(true);
      
      // 检查是否所有问题都已回答
      if (savedProgress.currentIndex >= userSettings.current.questionsPerDay) {
        setIsCompleted(true);
      }
    }
    
    setCompletionDates(savedCompletionDates);
  }, [today]);

  // 保存进度
  useEffect(() => {
    if (isStarted && questions.length > 0) {
      saveProgress(questions, currentQuestionIndex);
      
      // 标记完成
      if (currentQuestionIndex >= userSettings.current.questionsPerDay && !isCompleted) {
        setIsCompleted(true);
        saveCompletionDate(today);
        setCompletionDates([...completionDates, today]);
      }
    }
  }, [questions, currentQuestionIndex, isStarted, isCompleted, completionDates, today]);

  // 开始训练
  const startTraining = () => {
    // 获取难度设置
    const { maxNumber, minOperators } = getDifficultySettings(userSettings.current.difficulty);
    
    // 生成题目
    const newQuestions = Array.from({ length: userSettings.current.questionsPerDay }, () => {
      const { questionText, correctAnswer } = generateQuestionByDifficulty(
        userSettings.current.difficulty === 'adaptive' ? 5 : // 中等难度开始
        userSettings.current.difficulty === 'easy' ? 3 :
        userSettings.current.difficulty === 'medium' ? 5 : 8,
        minOperators
      );
      return {
        question: questionText,
        answer: correctAnswer,
        operators: getOperatorsFromQuestion(questionText)
      };
    });
    
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setIsStarted(true);
    setIsCompleted(false);
    setCurrentView(AppView.TRAINING);
    
    // 记录开始回答时间
    answerTimeStart.current = Date.now();
  };

  // 提交答案
  const handleAnswer = (userAnswer: number) => {
    // 计算答题时间
    const endTime = Date.now();
    const timeSpent = endTime - answerTimeStart.current;
    
    // 获取当前题目
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = isAnswerCorrect(userAnswer, currentQuestion.answer);
    
    // 更新题目
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer,
      startTime: answerTimeStart.current,
      endTime
    };
    
    setQuestions(updatedQuestions);
    
    // 更新用户统计数据
    updateUserStats(isCorrect, timeSpent, currentQuestion.operators || []);
    
    // 如果答错了，添加到错题本
    if (!isCorrect) {
      addMistake(
        currentQuestion.question,
        currentQuestion.answer,
        userAnswer,
        currentQuestion.operators || [],
        userSettings.current.difficulty === 'easy' ? 3 :
        userSettings.current.difficulty === 'medium' ? 5 : 8
      );
    }
    
    // 移动到下一题
    if (currentQuestionIndex < userSettings.current.questionsPerDay - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // 重置答题计时器
      answerTimeStart.current = Date.now();
    } else {
      setIsCompleted(true);
      saveCompletionDate(today);
      setCompletionDates([...completionDates, today]);
    }
  };
  
  // 分享进度
  const shareProgress = () => {
    const stats = {
      totalQuestions: userSettings.current.questionsPerDay,
      completedQuestions: currentQuestionIndex,
      streak: getUserStats().streakDays,
      date: today
    };
    
    // 创建分享文本
    const shareText = `我今天在趣味口算训练完成了${stats.completedQuestions}/${stats.totalQuestions}题，已连续训练${stats.streak}天！来一起提高口算能力吧！`;
    
    // 使用网页分享API（如果可用）
    if (navigator.share) {
      navigator.share({
        title: '趣味口算训练进度',
        text: shareText,
        url: window.location.href
      }).catch(err => {
        console.error('分享失败:', err);
        // 如果分享API不可用，回退到复制到剪贴板
        copyToClipboard(shareText);
      });
    } else {
      // 复制到剪贴板
      copyToClipboard(shareText);
    }
  };
  
  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板，可以粘贴分享给好友！');
    }).catch(err => {
      console.error('复制到剪贴板失败:', err);
      alert('分享失败，请手动复制以下内容：\n\n' + text);
    });
  };

  return (
    <ThemeProvider theme={themes[currentTheme as keyof typeof themes]}>
      <GlobalStyle theme={themes[currentTheme as keyof typeof themes]} />
      <AppContainer>
        <Header theme={themes[currentTheme as keyof typeof themes]}>
          <Title>趣味口算训练</Title>
          
          <NavBar>
            <NavButton 
              active={currentView === AppView.TRAINING} 
              onClick={() => setCurrentView(AppView.TRAINING)}
              theme={themes[currentTheme as keyof typeof themes]}>
              训练
            </NavButton>
            <NavButton 
              active={currentView === AppView.STATS} 
              onClick={() => setCurrentView(AppView.STATS)}
              theme={themes[currentTheme as keyof typeof themes]}>
              统计
            </NavButton>
            <NavButton 
              active={currentView === AppView.MISTAKES} 
              onClick={() => setCurrentView(AppView.MISTAKES)}
              theme={themes[currentTheme as keyof typeof themes]}>
              错题本
            </NavButton>
            <NavButton 
              active={currentView === AppView.SETTINGS} 
              onClick={() => setCurrentView(AppView.SETTINGS)}
              theme={themes[currentTheme as keyof typeof themes]}>
              设置
            </NavButton>
          </NavBar>
          
          {isStarted && currentView === AppView.TRAINING && (
            <Progress theme={themes[currentTheme as keyof typeof themes]}>
              进度: {currentQuestionIndex}/{userSettings.current.questionsPerDay}
            </Progress>
          )}
        </Header>

        <MainContent>
          {currentView === AppView.TRAINING && (
            !isStarted ? (
              <>
                <IntroText theme={themes[currentTheme as keyof typeof themes]}>
                  欢迎来到趣味口算训练！这是一个专为提高计算能力设计的应用程序。
                  每道题目都包含至少两种不同的运算符（加、减、乘、除），帮助您全面提升计算能力。
                  每天{userSettings.current.questionsPerDay}题，完成后会在日历上显示打卡成功。加油吧！
                </IntroText>
                <StartButton 
                  onClick={startTraining}
                  theme={themes[currentTheme as keyof typeof themes]}>
                  开始今日训练
                </StartButton>
              </>
            ) : isCompleted ? (
              <>
                <CompletionMessage theme={themes[currentTheme as keyof typeof themes]}>
                  🎉 太棒了！今日训练已完成！🎉
                </CompletionMessage>
                <Calendar completionDates={completionDates} />
                <ShareButton 
                  onClick={shareProgress}
                  theme={themes[currentTheme as keyof typeof themes]}>
                  分享我的成绩
                </ShareButton>
              </>
            ) : (
              <>
                <Question
                  questionText={questions[currentQuestionIndex].question}
                  onSubmit={handleAnswer}
                />
                <Calendar completionDates={completionDates} />
              </>
            )
          )}
          
          {currentView === AppView.STATS && <StatsView />}
          
          {currentView === AppView.MISTAKES && <MistakesView />}
          
          {currentView === AppView.SETTINGS && <SettingsView />}
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App; 