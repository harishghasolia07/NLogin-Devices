import { v4 as uuidv4 } from 'uuid';

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export const getDeviceInfo = (): string => {
  if (typeof window === 'undefined') return 'Unknown Device';
  
  const userAgent = navigator.userAgent;
  let deviceInfo = 'Unknown Device';
  
  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    deviceInfo = 'Chrome Browser';
  } else if (userAgent.includes('Firefox')) {
    deviceInfo = 'Firefox Browser';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    deviceInfo = 'Safari Browser';
  } else if (userAgent.includes('Edg')) {
    deviceInfo = 'Edge Browser';
  }
  
  // Detect mobile
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceInfo = `Mobile ${deviceInfo}`;
  }
  
  return deviceInfo;
};