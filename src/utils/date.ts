/**
 * 获取今日日期字符串 (YYYY-MM-DD)
 */
export const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 格式化日期显示 (年/月/日)
 */
export const formatPickerDisplay = (value?: Date | null) => {
  if (!value) return '年/月/日';
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * 格式化日期为存储格式 (YYYY-MM-DD)
 */
export const formatDateForStorage = (value?: Date | null) => {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取今日的友好显示格式 (MM月DD日 周X)
 */
export const getTodayFriendlyDisplay = () => {
  const date = new Date();
  const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const week = weekMap[date.getDay()];
  const month = `${date.getMonth() + 1}`.toString().padStart(2, '0');
  const day = `${date.getDate()}`.toString().padStart(2, '0');
  return `${month}月${day}日 ${week}`;
};

