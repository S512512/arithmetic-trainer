import React from 'react';
import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';

interface CalendarProps {
  completionDates: string[];
}

const CalendarContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 25px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 3px solid #ffccbc;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CalendarTitle = styled.h2`
  margin: 0;
  color: #e64a19;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 28px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 15px;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  font-weight: bold;
  padding: 10px;
  color: #5d4037;
  background-color: #ffe0b2;
  border-radius: 10px;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

interface DayProps {
  isCurrentMonth: boolean;
  isToday: boolean;
  isCompleted: boolean;
}

const Day = styled.div<DayProps>`
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: default;
  font-weight: ${props => (props.isToday ? 'bold' : 'normal')};
  color: ${props => (!props.isCurrentMonth ? '#ccc' : props.isToday ? '#303f9f' : '#5d4037')};
  background-color: ${props => {
    if (props.isCompleted) return '#66bb6a';
    if (props.isToday) return '#e3f2fd';
    return props.isCurrentMonth ? '#fff3e0' : 'transparent';
  }};
  color: ${props => (props.isCompleted ? 'white' : undefined)};
  border: ${props => (props.isToday ? '2px dashed #2196f3' : 'none')};
  box-shadow: ${props => (props.isCompleted || props.isToday ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none')};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  justify-content: center;
  background-color: #fff8e1;
  padding: 15px;
  border-radius: 15px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #5d4037;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CalendarFooter = styled.div`
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #7e57c2;
  font-style: italic;
`;

const Calendar: React.FC<CalendarProps> = ({ completionDates }) => {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get weekdays for headers (0 = Sunday, 6 = Saturday)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  
  // Check if a date is in the completion dates
  const isDateCompleted = (date: Date) => {
    return completionDates.some(completionDate => {
      const parsedDate = parseISO(completionDate);
      return isSameDay(parsedDate, date);
    });
  };
  
  // Count total completed days this month
  const completedDaysThisMonth = days.filter(day => isDateCompleted(day)).length;
  
  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>{format(currentDate, 'yyyy年MM月')}</CalendarTitle>
      </CalendarHeader>
      
      <CalendarGrid>
        {/* Weekday headers */}
        {weekdays.map(weekday => (
          <WeekdayHeader key={weekday}>{weekday}</WeekdayHeader>
        ))}
        
        {/* Calendar days */}
        {days.map(day => (
          <Day 
            key={day.toString()}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isToday={isToday(day)}
            isCompleted={isDateCompleted(day)}
          >
            {format(day, 'd')}
          </Day>
        ))}
      </CalendarGrid>
      
      <Legend>
        <LegendItem>
          <LegendColor color="#66bb6a" />
          <span>打卡成功</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#e3f2fd" />
          <span>今日</span>
        </LegendItem>
      </Legend>
      
      <CalendarFooter>
        本月已完成 {completedDaysThisMonth} 天训练，继续加油！
      </CalendarFooter>
    </CalendarContainer>
  );
};

export default Calendar; 