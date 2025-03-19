import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserSettings, saveUserSettings, DifficultyLevel, UserSettings } from '../utils/userSettings';

// 样式组件
const SettingsContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SettingsHeader = styled.h2`
  color: #5c6bc0;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #424242;
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 10px;
  border: 2px solid #c5cae9;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #7986cb;
  }
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 10px;
  border: 2px solid #c5cae9;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #7986cb;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  input {
    width: 20px;
    height: 20px;
  }
`;

const SaveButton = styled.button`
  background-color: #5c6bc0;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3f51b5;
  }
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: center;
`;

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 处理设置变更
  const handleChange = (field: keyof UserSettings, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
    
    // 清除保存成功提示
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };
  
  // 保存设置
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    saveUserSettings(settings);
    setSaveSuccess(true);
    
    // 3秒后清除保存成功提示
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  return (
    <SettingsContainer>
      <SettingsHeader>设置</SettingsHeader>
      
      <SettingsForm onSubmit={handleSave}>
        <FormGroup>
          <Label>用户名</Label>
          <Input 
            type="text" 
            value={settings.username} 
            onChange={(e) => handleChange('username', e.target.value)}
            maxLength={20}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>难度级别</Label>
          <Select 
            value={settings.difficulty} 
            onChange={(e) => handleChange('difficulty', e.target.value as DifficultyLevel)}
          >
            <option value={DifficultyLevel.EASY}>简单</option>
            <option value={DifficultyLevel.MEDIUM}>中等</option>
            <option value={DifficultyLevel.HARD}>困难</option>
            <option value={DifficultyLevel.ADAPTIVE}>自适应（根据表现调整）</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>每日题目数量</Label>
          <Input 
            type="number" 
            value={settings.questionsPerDay} 
            onChange={(e) => handleChange('questionsPerDay', parseInt(e.target.value))}
            min={10}
            max={200}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>主题</Label>
          <Select 
            value={settings.theme} 
            onChange={(e) => handleChange('theme', e.target.value)}
          >
            <option value="default">默认主题</option>
            <option value="dark">暗色主题</option>
            <option value="colorful">缤纷主题</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Checkbox>
            <input 
              type="checkbox" 
              checked={settings.sound} 
              onChange={(e) => handleChange('sound', e.target.checked)}
            />
            <Label>启用音效</Label>
          </Checkbox>
        </FormGroup>
        
        <SaveButton type="submit">保存设置</SaveButton>
        
        {saveSuccess && (
          <SuccessMessage>设置已保存！</SuccessMessage>
        )}
      </SettingsForm>
    </SettingsContainer>
  );
};

export default SettingsView; 