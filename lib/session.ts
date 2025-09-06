import Cookies from 'js-cookie';

export const SESSION_COOKIE_NAME = 'ndevice_session_id';

export const setSessionId = (sessionId: string) => {
  Cookies.set(SESSION_COOKIE_NAME, sessionId, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const getSessionId = (): string | undefined => {
  return Cookies.get(SESSION_COOKIE_NAME);
};

export const clearSessionId = () => {
  Cookies.remove(SESSION_COOKIE_NAME);
};