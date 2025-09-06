'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, RefreshCw, LogOut, AlertCircle } from 'lucide-react';
import { Session, sessionAPI } from '@/lib/api';
import { formatDistance } from 'date-fns';
import { toast } from 'sonner';
import { clearSessionId } from '@/lib/session';

interface SessionManagerProps {
  userId: string;
  currentSessionId: string;
}

export function SessionManager({ userId, currentSessionId, suspendAutoLogout = false }: SessionManagerProps & { suspendAutoLogout?: boolean }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState<string | null>(null);
  const router = useRouter();

  const loadSessions = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await sessionAPI.getActiveSessions(userId);
      setSessions(response.sessions);

      // Check if current session is still active
      const currentSessionExists = response.sessions.some(
        session => session.sessionId === currentSessionId && session.active
      );

      if (!currentSessionExists && currentSessionId) {
        // Also check a global debug flag set by DeviceLimitModal in case props didn't propagate yet
        const globalOpen = typeof window !== 'undefined' ? (window as any).__deviceLimitOpen : false;
        if (suspendAutoLogout || globalOpen) {
          // Keep user on the page while the device-limit modal is open
          return;
        }
        clearSessionId();
        toast.error('You were logged out because your account was signed in on another device.', {
          duration: 8000,
          action: {
            label: 'Sign In Again',
            onClick: () => window.location.href = '/api/auth/login'
          }
        });
        // Add a delay to let user read the message before redirect
        setTimeout(() => {
          router.push('/api/auth/logout');
        }, 1000);
        return;
      }

    } catch (error) {
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  }, [userId, currentSessionId, router, suspendAutoLogout]);

  const refreshSessions = async () => {
    setRefreshing(true);
    await loadSessions(false);
    setRefreshing(false);
    toast.success('Sessions refreshed');
  };

  const handleLogoutSession = async (sessionId: string) => {
    setLoggingOut(sessionId);
    try {
      await sessionAPI.logout(sessionId);
      toast.success('Session logged out successfully');
      await loadSessions(false);
    } catch (error) {
      toast.error('Failed to logout session');
    } finally {
      setLoggingOut(null);
    }
  };

  useEffect(() => {
    loadSessions();

    // Set up periodic check for current session validity
    const intervalId = setInterval(() => {
      loadSessions(false); // Check without showing loading spinner
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [loadSessions, currentSessionId]);


  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <Monitor className="w-5 h-5" />;
    if (deviceInfo.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-blue-600" />;
    }
    return <Monitor className="w-5 h-5 text-green-600" />;
  };

  const getLastSeenText = (lastSeen: string) => {
    try {
      return formatDistance(new Date(lastSeen), new Date(), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const isCurrentSession = (sessionId: string) => sessionId === currentSessionId;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage devices that are currently logged into your account
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSessions}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <Card
                key={session.sessionId}
                className={`border-2 transition-colors ${isCurrentSession(session.sessionId)
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isCurrentSession(session.sessionId)
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                        }`}>
                        {getDeviceIcon(session.deviceInfo)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {session.deviceInfo || `Device ${index + 1}`}
                          {isCurrentSession(session.sessionId) && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Current Device
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last active: {getLastSeenText(session.lastSeen)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created: {getLastSeenText(session.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                      {!isCurrentSession(session.sessionId) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLogoutSession(session.sessionId)}
                          disabled={loggingOut === session.sessionId}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {loggingOut === session.sessionId ? (
                            <>Logging out...</>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 mr-1" />
                              Log Out
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sessions.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Device Limit:</strong> You can be logged in on up to 2 devices simultaneously.
              When you try to log in on a 3rd device, you&apos;ll need to log out from one of these sessions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}