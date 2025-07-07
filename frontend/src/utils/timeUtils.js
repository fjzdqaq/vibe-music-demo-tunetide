// 北京时间工具函数

// 获取北京时间的当前时间
export const getBeijingTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 3600000));
};

// 将任意时间转换为北京时间
export const toBeijingTime = (date) => {
  const inputDate = new Date(date);
  return new Date(inputDate.getTime() + (inputDate.getTimezoneOffset() * 60000) + (8 * 3600000));
};

// 格式化北京时间为datetime-local格式 (YYYY-MM-DDTHH:mm)
export const formatBeijingTimeForInput = (date) => {
  const beijingDate = date instanceof Date ? date : toBeijingTime(date);
  
  const year = beijingDate.getFullYear();
  const month = String(beijingDate.getMonth() + 1).padStart(2, '0');
  const day = String(beijingDate.getDate()).padStart(2, '0');
  const hours = String(beijingDate.getHours()).padStart(2, '0');
  const minutes = String(beijingDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 将datetime-local输入值转换为北京时间Date对象
export const parseBeijingTimeFromInput = (inputValue) => {
  // inputValue格式: "2024-01-01T12:30"
  return new Date(inputValue + ':00+08:00'); // 添加秒和北京时区
};

// 格式化时间为显示用的字符串 (UTC -> 北京时间)
export const formatBeijingTimeForDisplay = (utcDateString) => {
  if (!utcDateString) return '';
  
  // 1. 将UTC字符串转换为Date对象
  const utcDate = new Date(utcDateString);
  if (isNaN(utcDate.getTime())) {
    return '无效日期';
  }

  // 2. 直接使用 toLocaleString 并指定时区
  return utcDate.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai', // 指定北京时区
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
};

// 添加时间（天数）
export const addDaysToBeijingTime = (date, days) => {
  const beijingDate = date instanceof Date ? date : toBeijingTime(date);
  return new Date(beijingDate.getTime() + days * 24 * 60 * 60 * 1000);
}; 