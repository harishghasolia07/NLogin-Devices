'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, AlertCircle, LogOut } from 'lucide-react';
import { Session } from '@/lib/api';
import { formatDistance } from 'date-fns';

interface DeviceLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  onLogoutDevice: (sessionId: string) => void;
  onCancel: () => void;
  loading: boolean;
}

export function DeviceLimitModal({
  isOpen,
  onClose,
  sessions,
  onLogoutDevice,
  onCancel,
  loading
}: DeviceLimitModalProps) {
  const [loggingOutSession, setLoggingOutSession] = useState<string | null>(null);

  useEffect(() => {
    // Clean up on unmount (no prop refs to avoid deps lint)
    return () => {
      // Clean up global debug flag on unmount
      if (typeof window !== 'undefined') {
        (window as any).__deviceLimitOpen = false;
      }
    };
  }, []);

  // Reflect open state in a global flag to help other components (like SessionManager) avoid redirecting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore Global window flag to coordinate between components
      window.__deviceLimitOpen = isOpen;
    }
  }, [isOpen]);

  const handleLogoutDevice = async (sessionId: string) => {
    setLoggingOutSession(sessionId);
    try {
      await onLogoutDevice(sessionId);
    } finally {
      setLoggingOutSession(null);
    }
  };

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <Monitor className="w-5 h-5" />;
    if (deviceInfo.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getLastSeenText = (lastSeen: string) => {
    try {
      return formatDistance(new Date(lastSeen), new Date(), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Dialog
      open={isOpen}
      // Ignore external close attempts; we close explicitly via actions
      onOpenChange={(open) => {
        if (!open) {
          // Close ignored - controlled component
        }
      }}
    >
      <DialogContent
        className="max-w-2xl"
        // Prevent accidental close via outside click or ESC while resolving
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Device Limit Reached
          </DialogTitle>
          <DialogDescription className="text-lg">
            You can only be logged in on 3 devices at once. Please select a device to log out from, or cancel this login attempt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Action Required</span>
            </div>
            <p className="text-orange-700 mt-1">
              Choose one of your existing sessions to log out, or cancel this login.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Active Sessions</h3>
            {sessions.map((session, index) => (
              <Card key={session.sessionId} className="border-2 hover:border-blue-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getDeviceIcon(session.deviceInfo)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.deviceInfo || `Device ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last active: {getLastSeenText(session.lastSeen)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogoutDevice(session.sessionId)}
                        disabled={loading || loggingOutSession === session.sessionId}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {loggingOutSession === session.sessionId ? (
                          <>Logging out...</>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4 mr-1" />
                            Log Out
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="px-6"
            >
              Cancel Login
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}