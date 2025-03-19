import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getMistakes, getMistakesToReview, removeMistake, updateMistakeReview, MistakeRecord } from '../utils/mistakesUtils';

// 样式组件
const MistakesContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
`;

const MistakesHeader = styled.h2`
  color: #e57373;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #9e9e9e;
`;

const MistakesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const MistakeCard = styled.div`
  background-color: white;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #e57373;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MistakeQuestion = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #424242;
`;

const MistakeAnswers = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const AnswerBox = styled.div<{ isCorrect: boolean }>`
  background-color: ${props => props.isCorrect ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.isCorrect ? '#2e7d32' : '#c62828'};
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
`;

const MistakeInfo = styled.div`
  font-size: 0.9rem;
  color: #757575;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
`;

const ReviewButton = styled.button`
  background-color: #7986cb;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #5c6bc0;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  color: #bdbdbd;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  
  &:hover {
    color: #f44336;
  }
`;

const ReviewContainer = styled.div`
  background-color: #e8eaf6;
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const ReviewQuestion = styled.div`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
  color: #3f51b5;
  font-weight: bold;
`;

const AnswerInput = styled.input`
  width: 100%;
  padding: 15px;
  font-size: 1.5rem;
  border: 2px solid #c5cae9;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: #7986cb;
  }
`;

const SubmitButton = styled.button`
  background-color: #5c6bc0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 1.2rem;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3f51b5;
  }
`;

const ResultMessage = styled.div<{ isCorrect: boolean }>`
  text-align: center;
  font-size: 1.5rem;
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  background-color: ${props => props.isCorrect ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.isCorrect ? '#2e7d32' : '#c62828'};
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#e57373' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : '#424242'};
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.active ? '#ef5350' : '#bdbdbd'};
  }
`;

enum MistakesTab {
  ALL = 'all',
  REVIEW = 'review'
}

const MistakesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MistakesTab>(MistakesTab.ALL);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [mistakesToReview, setMistakesToReview] = useState<MistakeRecord[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // 加载错题数据
  useEffect(() => {
    loadMistakes();
  }, []);
  
  const loadMistakes = () => {
    setMistakes(getMistakes());
    setMistakesToReview(getMistakesToReview());
  };
  
  // 处理删除错题
  const handleRemoveMistake = (id: string) => {
    removeMistake(id);
    loadMistakes();
  };
  
  // 处理开始复习
  const handleStartReview = () => {
    setActiveTab(MistakesTab.REVIEW);
    setCurrentReviewIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setMistakesToReview(getMistakesToReview());
  };
  
  // 处理提交答案
  const handleSubmitAnswer = () => {
    const currentMistake = mistakesToReview[currentReviewIndex];
    const numAnswer = Number(userAnswer);
    
    if (!isNaN(numAnswer)) {
      const correct = numAnswer === currentMistake.correctAnswer;
      setIsCorrect(correct);
      setShowResult(true);
      
      if (correct) {
        // 如果回答正确，标记为已复习
        updateMistakeReview(currentMistake.id);
      }
    }
  };
  
  // 处理继续下一题
  const handleNextQuestion = () => {
    if (currentReviewIndex < mistakesToReview.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      // 复习完成，重新加载错题
      loadMistakes();
      setActiveTab(MistakesTab.ALL);
    }
  };
  
  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };
  
  return (
    <MistakesContainer>
      <MistakesHeader>错题本</MistakesHeader>
      
      <TabContainer>
        <Tab 
          active={activeTab === MistakesTab.ALL} 
          onClick={() => setActiveTab(MistakesTab.ALL)}>
          全部错题
        </Tab>
        <Tab 
          active={activeTab === MistakesTab.REVIEW} 
          onClick={handleStartReview}>
          开始复习
        </Tab>
      </TabContainer>
      
      {activeTab === MistakesTab.ALL && (
        mistakes.length === 0 ? (
          <EmptyMessage>还没有添加任何错题</EmptyMessage>
        ) : (
          <MistakesList>
            {mistakes.map(mistake => (
              <MistakeCard key={mistake.id}>
                <RemoveButton onClick={() => handleRemoveMistake(mistake.id)}>×</RemoveButton>
                <MistakeQuestion>{mistake.question}</MistakeQuestion>
                
                <MistakeAnswers>
                  <div>
                    <span>你的答案: </span>
                    <AnswerBox isCorrect={false}>{mistake.userAnswer}</AnswerBox>
                  </div>
                  <div>
                    <span>正确答案: </span>
                    <AnswerBox isCorrect={true}>{mistake.correctAnswer}</AnswerBox>
                  </div>
                </MistakeAnswers>
                
                <MistakeInfo>
                  <div>错误次数: {mistake.attempts}</div>
                  <div>日期: {formatDate(mistake.timestamp)}</div>
                </MistakeInfo>
                
                <ReviewButton onClick={handleStartReview}>复习</ReviewButton>
              </MistakeCard>
            ))}
          </MistakesList>
        )
      )}
      
      {activeTab === MistakesTab.REVIEW && mistakesToReview.length > 0 && (
        <ReviewContainer>
          <ReviewQuestion>
            {mistakesToReview[currentReviewIndex].question}
          </ReviewQuestion>
          
          {!showResult ? (
            <>
              <AnswerInput 
                type="number" 
                value={userAnswer} 
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="请输入答案"
                autoFocus
              />
              <SubmitButton onClick={handleSubmitAnswer}>提交</SubmitButton>
            </>
          ) : (
            <>
              <ResultMessage isCorrect={isCorrect}>
                {isCorrect ? '回答正确！' : `正确答案是: ${mistakesToReview[currentReviewIndex].correctAnswer}`}
              </ResultMessage>
              <SubmitButton onClick={handleNextQuestion}>
                {currentReviewIndex < mistakesToReview.length - 1 ? '下一题' : '完成复习'}
              </SubmitButton>
            </>
          )}
        </ReviewContainer>
      )}
      
      {activeTab === MistakesTab.REVIEW && mistakesToReview.length === 0 && (
        <EmptyMessage>没有需要复习的错题</EmptyMessage>
      )}
    </MistakesContainer>
  );
};

export default MistakesView; 