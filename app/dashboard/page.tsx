'use client';

import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Shield, LogOut, AlertCircle } from 'lucide-react';
import { sessionAPI, Session } from '@/lib/api';
import { getDeviceId, getDeviceInfo } from '@/lib/device';
import { setSessionId, getSessionId, clearSessionId } from '@/lib/session';
import { DeviceLimitModal } from '@/components/DeviceLimitModal';
import { SessionManager } from '@/components/SessionManager';
import { toast } from 'sonner';

function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [validatingSession, setValidatingSession] = useState(true);
  const [showDeviceLimitModal, setShowDeviceLimitModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [deviceLimitLoading, setDeviceLimitLoading] = useState(false);

  // Use a ref to track if we've already handled device limit for this session
  const deviceLimitHandledRef = useRef(false);

  useEffect(() => {
    const reason = searchParams?.get('reason');
    if (reason === 'logged_out') {
      toast.error('You were logged out because your account was signed in on another device.', {
        duration: 5000,
      });
    }
  }, [searchParams]);

  const initializeSession = useCallback(async () => {
    if (!user?.sub) return;

    // Don't reinitialize if device limit modal is already open
    if (showDeviceLimitModal) {
      return;
    }

    // Prevent multiple simultaneous login attempts
    if (typeof window !== 'undefined' && (window as any).__loginInProgress) {
      return;
    }

    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();
    const existingSessionId = getSessionId();

    // Set login in progress flag
    if (typeof window !== 'undefined') {
      (window as any).__loginInProgress = true;
    }

    // First, validate existing session if it exists
    if (existingSessionId) {
      try {
        const validation = await sessionAPI.validate(existingSessionId);
        if (validation.valid) {
          setCurrentSessionId(existingSessionId);
          setValidatingSession(false);
          return;
        } else if (validation.reason === 'logged_out') {
          clearSessionId();
          router.push('/dashboard?reason=logged_out');
          return;
        }
      } catch (error) {
        clearSessionId();
      }
    }

    // Try to create new session
    try {
      const response = await sessionAPI.login(user.sub, deviceId);

      if (response.status === 'ok' && response.sessionId) {
        setSessionId(response.sessionId);
        setCurrentSessionId(response.sessionId);
        toast.success('Successfully logged in!');
      } else if (response.status === 'limit_reached' && response.activeSessions) {
        // Check if we've already handled device limit for this session to prevent multiple modals
        if (deviceLimitHandledRef.current) {
          return;
        }

        deviceLimitHandledRef.current = true;

        // Ensure session manager is suppressed while resolving limit
        clearSessionId();
        setCurrentSessionId(null);
        setActiveSessions(response.activeSessions);
        if (typeof window !== 'undefined') {
          // @ts-ignore Global flag used by SessionManager to prevent auto-logout during device limit resolution
          window.__deviceLimitOpen = true;
        }
        setShowDeviceLimitModal(true);
        // Keep user on modal until they take an action; do not close automatically
      }
    } catch (error) {
      toast.error('Failed to initialize session');
      router.push('/api/auth/logout');
    } finally {
      setValidatingSession(false);
      // Clear login in progress flag
      if (typeof window !== 'undefined') {
        (window as any).__loginInProgress = false;
      }
    }
  }, [router, user?.sub, showDeviceLimitModal]);

  useEffect(() => {
    if (user && !isLoading && !showDeviceLimitModal) {
      initializeSession();
    }
  }, [user, isLoading, showDeviceLimitModal, initializeSession]);

  const handleLogoutDevice = async (sessionId: string) => {
    if (!user?.sub) return;

    setDeviceLimitLoading(true);
    try {
      await sessionAPI.forceLogout(sessionId);

      // Retry login after logging out the selected device
      const deviceId = getDeviceId();
      const response = await sessionAPI.login(user.sub, deviceId);

      if (response.status === 'ok' && response.sessionId) {
        setSessionId(response.sessionId);
        setCurrentSessionId(response.sessionId);
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.__deviceLimitOpen = false;
        }
        setShowDeviceLimitModal(false);
        toast.success('Successfully logged in after freeing up a device slot!');
      } else if (response.status === 'limit_reached' && response.activeSessions) {
        // Still at limit (race condition) - refresh list and keep modal open
        setActiveSessions(response.activeSessions);
        setShowDeviceLimitModal(true);
        toast.message('Device limit unchanged. Pick another device to log out.');
      } else {
        toast.error('Failed to log in after logout. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to log out the selected device');
    } finally {
      setDeviceLimitLoading(false);
    }
  };

  const handleCancelLogin = () => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.__deviceLimitOpen = false;
    }
    // Reset the device limit handled flag so it can be shown again in future
    deviceLimitHandledRef.current = false;
    setShowDeviceLimitModal(false);
    router.push('/api/auth/logout');
  };

  const handleManualLogout = async () => {
    if (currentSessionId) {
      try {
        await sessionAPI.logout(currentSessionId);
        clearSessionId();
        toast.success('Successfully logged out');
      } catch (error) {
        // Silent error handling for logout
      }
    }
    router.push('/api/auth/logout');
  };

  if (isLoading || validatingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back to your secure account</p>
            </div>
            <Button
              onClick={handleManualLogout}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* User Profile Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Profile
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Your account information and security status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Profile Picture & Name */}
                  <div className="flex items-center gap-4">
                    {typeof user.picture === 'string' && (
                      <Image
                        src={user.picture}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {user.email?.split('@')[0] || user.name || user.nickname || 'User'}
                      </h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Account
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* User Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    {typeof (user as any).phone_number === 'string' && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium text-gray-900">{(user as any).phone_number}</p>
                        </div>
                      </div>
                    )}

                    {!((user as any).phone_number) && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Phone className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-amber-700">
                            <strong>Phone Number:</strong> Not configured
                          </p>
                          <p className="text-xs text-amber-600">
                            Add your phone number in your Auth0 profile for enhanced security
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">User ID</p>
                        <p className="font-mono text-sm text-gray-700">{user.sub}</p>
                      </div>
                    </div>
                  </div>

                  {/* Security Status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Security Status: Active</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Your account is protected with Auth0 security and device session management.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Manager */}
            {user.sub && currentSessionId && !showDeviceLimitModal && (
              <SessionManager
                userId={user.sub}
                currentSessionId={currentSessionId}
                suspendAutoLogout={showDeviceLimitModal}
              />
            )}
          </div>

          {/* Session Warning */}
          {!currentSessionId && (
            <Card className="mt-8 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-orange-800">
                  <AlertCircle className="w-6 h-6" />
                  <div>
                    <p className="font-medium">Session Warning</p>
                    <p className="text-sm text-orange-700">
                      Your session is not properly initialized. Please refresh the page or sign in again.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Device Limit Modal */}
      <DeviceLimitModal
        isOpen={showDeviceLimitModal}
        onClose={() => {
          if (typeof window !== 'undefined') {
            // @ts-ignore
            window.__deviceLimitOpen = false;
          }
          setShowDeviceLimitModal(false);
        }}
        sessions={activeSessions}
        onLogoutDevice={handleLogoutDevice}
        onCancel={handleCancelLogin}
        loading={deviceLimitLoading}
      />
    </>
  );
}

export default withPageAuthRequired(Dashboard);
