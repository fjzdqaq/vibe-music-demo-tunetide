// 北京时间工具函数

// 获取北京时间的当前时间
const getBeijingTime = () => {
  const now = new Date();
  return new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
};

// 将UTC时间转换为北京时间
const utcToBeijingTime = (utcDate) => {
  const date = new Date(utcDate);
  return new Date(date.getTime() + 8 * 60 * 60 * 1000);
};

// 将北京时间转换为UTC时间
const beijingToUtcTime = (beijingDate) => {
  const date = new Date(beijingDate);
  return new Date(date.getTime() - 8 * 60 * 60 * 1000);
};

// 格式化北京时间为显示字符串
const formatBeijingTime = (date) => {
  const beijingDate = date instanceof Date ? date : new Date(date);
  const utcDate = new Date(beijingDate.getTime() + 8 * 60 * 60 * 1000);
  
  return utcDate.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// 检查时间是否在北京时间的未来
const isInBeijingFuture = (targetTime) => {
  const beijingNow = getBeijingTime();
  const beijingTarget = new Date(targetTime);
  
  return beijingTarget.getTime() > beijingNow.getTime();
};

// 计算两个时间之间的北京时间差（分钟）
const getBeijingTimeDiffMinutes = (time1, time2) => {
  const date1 = new Date(time1);
  const date2 = new Date(time2);
  
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60);
};

module.exports = {
  getBeijingTime,
  utcToBeijingTime,
  beijingToUtcTime,
  formatBeijingTime,
  isInBeijingFuture,
  getBeijingTimeDiffMinutes
}; 