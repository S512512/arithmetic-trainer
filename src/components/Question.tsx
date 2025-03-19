import React, { useState, KeyboardEvent } from 'react';
import styled from 'styled-components';

interface QuestionProps {
  questionText: string;
  onSubmit: (answer: number) => void;
}

const QuestionContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 25px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 3px solid #b3e5fc;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const QuestionText = styled.div`
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #3949ab;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  padding: 15px;
  background-color: #e3f2fd;
  border-radius: 15px;
  display: inline-block;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const AnswerInput = styled.input`
  font-size: 26px;
  padding: 12px 20px;
  border: 3px solid #64b5f6;
  border-radius: 50px;
  width: 180px;
  text-align: center;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Comic Sans MS', Arial, sans-serif;
  
  &:focus {
    border-color: #2196f3;
    box-shadow: 0 0 12px rgba(33, 150, 243, 0.5);
  }
`;

const SubmitButton = styled.button`
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 14px 30px;
  font-size: 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  font-family: 'Comic Sans MS', Arial, sans-serif;
  font-weight: bold;

  &:hover {
    background-color: #f57c00;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const HintText = styled.p`
  margin-top: 20px;
  color: #7e57c2;
  font-size: 16px;
  font-style: italic;
`;

const Question: React.FC<QuestionProps> = ({ questionText, onSubmit }) => {
  const [answer, setAnswer] = useState<string>('');
  
  const handleSubmit = () => {
    const numericAnswer = Number(answer);
    if (!isNaN(numericAnswer)) {
      onSubmit(numericAnswer);
      setAnswer('');
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <QuestionContainer>
      <QuestionText>{questionText}</QuestionText>
      <InputContainer>
        <AnswerInput
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="输入答案"
        />
        <SubmitButton onClick={handleSubmit}>提交答案</SubmitButton>
      </InputContainer>
      <HintText>提示：计算题包含多种运算，注意运算顺序哦！</HintText>
    </QuestionContainer>
  );
};

export default Question; 