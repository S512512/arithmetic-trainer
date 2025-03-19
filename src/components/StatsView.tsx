import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserStats } from '../utils/userSettings';
import { getMistakeStatsByOperator } from '../utils/mistakesUtils';
import { Operator } from '../utils/mathUtils';

// 样式组件
const StatsContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
`;

const StatsHeader = styled.h2`
  color: #5c6bc0;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatTitle = styled.h3`
  color: #7e57c2;
  font-size: 1rem;
  margin-bottom: 10px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #4527a0;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin: 10px 0;
  height: 15px;
`;

const ProgressBar = styled.div<{ width: string; color: string }>`
  height: 100%;
  border-radius: 10px;
  background-color: ${props => props.color};
  width: ${props => props.width};
  transition: width 0.5s ease-in-out;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#5c6bc0' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : '#424242'};
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.active ? '#3f51b5' : '#bdbdbd'};
  }
`;

const ChartContainer = styled.div`
  height: 250px;
  margin: 20px 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 10px;
`;

const ChartBar = styled.div<{ height: string; color: string }>`
  width: 30px;
  height: ${props => props.height};
  background-color: ${props => props.color};
  border-radius: 5px 5px 0 0;
  transition: height 0.5s ease;
  position: relative;
  
  &:hover::after {
    content: attr(data-value);
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #424242;
    color: white;
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
`;

const BarLabel = styled.div`
  text-align: center;
  font-size: 12px;
  margin-top: 5px;
  color: #616161;
`;

const StreakContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
`;

const StreakValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #ff9800;
  margin: 10px 0;
`;

const StreakLabel = styled.div`
  font-size: 1.2rem;
  color: #757575;
`;

enum StatTab {
  OVERVIEW = 'overview',
  PERFORMANCE = 'performance',
  HISTORY = 'history'
}

const StatsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatTab>(StatTab.OVERVIEW);
  const [stats, setStats] = useState(getUserStats());
  const [operatorStats, setOperatorStats] = useState(getMistakeStatsByOperator());
  
  // 定期刷新统计数据
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getUserStats());
      setOperatorStats(getMistakeStatsByOperator());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 计算正确率百分比
  const correctPercentage = stats.totalQuestionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100)
    : 0;
    
  // 将平均时间从毫秒转换为秒，并保留一位小数
  const averageTimeInSeconds = (stats.averageTimePerQuestion / 1000).toFixed(1);
  
  // 获取每个运算符的掌握程度
  const getOperatorMastery = (operator: string) => {
    const perf = stats.performanceByOperator[operator];
    if (!perf || perf.total === 0) return 0;
    return Math.round((perf.correct / perf.total) * 100);
  };
  
  // 获取历史训练数据（最近7天）
  const recentHistory = [...stats.history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);
  
  return (
    <StatsContainer>
      <StatsHeader>训练统计</StatsHeader>
      
      <TabContainer>
        <Tab 
          active={activeTab === StatTab.OVERVIEW} 
          onClick={() => setActiveTab(StatTab.OVERVIEW)}>
          总览
        </Tab>
        <Tab 
          active={activeTab === StatTab.PERFORMANCE} 
          onClick={() => setActiveTab(StatTab.PERFORMANCE)}>
          运算表现
        </Tab>
        <Tab 
          active={activeTab === StatTab.HISTORY} 
          onClick={() => setActiveTab(StatTab.HISTORY)}>
          训练历史
        </Tab>
      </TabContainer>
      
      {activeTab === StatTab.OVERVIEW && (
        <>
          <StatsGrid>
            <StatCard>
              <StatTitle>总计题目</StatTitle>
              <StatValue>{stats.totalQuestionsAnswered}</StatValue>
            </StatCard>
            
            <StatCard>
              <StatTitle>正确率</StatTitle>
              <StatValue>{correctPercentage}%</StatValue>
              <ProgressBarContainer>
                <ProgressBar 
                  width={`${correctPercentage}%`} 
                  color={correctPercentage > 80 ? '#4caf50' : correctPercentage > 60 ? '#ff9800' : '#f44336'} 
                />
              </ProgressBarContainer>
            </StatCard>
            
            <StatCard>
              <StatTitle>平均用时</StatTitle>
              <StatValue>{averageTimeInSeconds}秒</StatValue>
            </StatCard>
          </StatsGrid>
          
          <StreakContainer>
            <StreakLabel>连续训练</StreakLabel>
            <StreakValue>{stats.streakDays}天</StreakValue>
          </StreakContainer>
        </>
      )}
      
      {activeTab === StatTab.PERFORMANCE && (
        <>
          <StatsGrid>
            <StatCard>
              <StatTitle>加法掌握度</StatTitle>
              <StatValue>{getOperatorMastery(Operator.ADDITION)}%</StatValue>
              <ProgressBarContainer>
                <ProgressBar 
                  width={`${getOperatorMastery(Operator.ADDITION)}%`}
                  color="#4caf50" 
                />
              </ProgressBarContainer>
            </StatCard>
            
            <StatCard>
              <StatTitle>减法掌握度</StatTitle>
              <StatValue>{getOperatorMastery(Operator.SUBTRACTION)}%</StatValue>
              <ProgressBarContainer>
                <ProgressBar 
                  width={`${getOperatorMastery(Operator.SUBTRACTION)}%`}
                  color="#2196f3" 
                />
              </ProgressBarContainer>
            </StatCard>
            
            <StatCard>
              <StatTitle>乘法掌握度</StatTitle>
              <StatValue>{getOperatorMastery(Operator.MULTIPLICATION)}%</StatValue>
              <ProgressBarContainer>
                <ProgressBar 
                  width={`${getOperatorMastery(Operator.MULTIPLICATION)}%`}
                  color="#9c27b0" 
                />
              </ProgressBarContainer>
            </StatCard>
            
            <StatCard>
              <StatTitle>除法掌握度</StatTitle>
              <StatValue>{getOperatorMastery(Operator.DIVISION)}%</StatValue>
              <ProgressBarContainer>
                <ProgressBar 
                  width={`${getOperatorMastery(Operator.DIVISION)}%`}
                  color="#ff9800" 
                />
              </ProgressBarContainer>
            </StatCard>
          </StatsGrid>
          
          <StatsHeader>错题统计</StatsHeader>
          <ChartContainer>
            {Object.entries(operatorStats).map(([op, count], index) => {
              const maxCount = Math.max(...Object.values(operatorStats));
              const height = maxCount > 0 ? Math.max(20, Math.round((count / maxCount) * 200)) : 0;
              const colors = ['#4caf50', '#2196f3', '#9c27b0', '#ff9800'];
              
              return (
                <div key={op} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ChartBar 
                    height={`${height}px`}
                    color={colors[index % colors.length]}
                    data-value={count}
                  />
                  <BarLabel>
                    {op === '+' ? '加法' : 
                     op === '-' ? '减法' : 
                     op === '*' ? '乘法' : '除法'}
                  </BarLabel>
                </div>
              );
            })}
          </ChartContainer>
        </>
      )}
      
      {activeTab === StatTab.HISTORY && (
        <>
          <StatsHeader>最近7天训练记录</StatsHeader>
          <ChartContainer>
            {recentHistory.map((day, index) => {
              const maxCorrect = Math.max(...recentHistory.map(d => d.correctAnswers));
              const height = maxCorrect > 0 ? Math.max(20, Math.round((day.correctAnswers / maxCorrect) * 200)) : 0;
              
              // 显示日期的月和日
              const dateParts = day.date.split('-');
              const displayDate = `${dateParts[1]}/${dateParts[2]}`;
              
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ChartBar 
                    height={`${height}px`}
                    color="#5c6bc0"
                    data-value={`${day.correctAnswers}/${day.totalQuestions}`}
                  />
                  <BarLabel>{displayDate}</BarLabel>
                </div>
              );
            })}
          </ChartContainer>
        </>
      )}
    </StatsContainer>
  );
};

export default StatsView; 