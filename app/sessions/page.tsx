'use client';

import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { sessionAPI } from '@/lib/api';
import { getSessionId, clearSessionId } from '@/lib/session';
import { SessionManager } from '@/components/SessionManager';
import { toast } from 'sonner';

function SessionsPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [validatingSession, setValidatingSession] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            const sessionId = getSessionId();
            if (!sessionId) {
                router.push('/dashboard');
                return;
            }

            try {
                const validation = await sessionAPI.validate(sessionId);
                if (validation.valid) {
                    setCurrentSessionId(sessionId);
                } else {
                    clearSessionId();
                    router.push('/dashboard?reason=logged_out');
                    return;
                }
            } catch (error) {
                clearSessionId();
                router.push('/dashboard');
                return;
            } finally {
                setValidatingSession(false);
            }
        };

        if (user && !isLoading) {
            validateSession();
        }
    }, [user, isLoading, router]);

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
                        <p className="text-gray-600">Loading session manager...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user || !currentSessionId) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Session Manager</h1>
                            <p className="text-gray-600 mt-1">Manage devices connected to your account</p>
                        </div>
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

                {/* Session Manager */}
                <div className="max-w-4xl">
                    <SessionManager
                        userId={user.sub!}
                        currentSessionId={currentSessionId}
                    />
                </div>

                {/* Information Card */}
                <Card className="mt-8 max-w-4xl">
                    <CardHeader>
                        <CardTitle>About Device Sessions</CardTitle>
                        <CardDescription>
                            Learn more about how device session management works
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Device Limit</h4>
                                <p className="text-sm text-gray-600">
                                    You can be logged in on up to 2 devices simultaneously. When you try to log in on a 3rd device,
                                    you&apos;ll need to log out from one of your existing sessions.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
                                <p className="text-sm text-gray-600">
                                    Each device maintains its own secure session. If you notice any unfamiliar devices,
                                    you can immediately log them out from this page.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Session Validation</h4>
                                <p className="text-sm text-gray-600">
                                    Your sessions are automatically validated every few seconds. If a session becomes invalid
                                    (e.g., logged out from another device), you&apos;ll be notified and redirected appropriately.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Device Information</h4>
                                <p className="text-sm text-gray-600">
                                    Device information is automatically detected based on your browser and operating system.
                                    This helps you identify which device each session belongs to.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default withPageAuthRequired(SessionsPage);
