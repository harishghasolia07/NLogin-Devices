'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Lock, Monitor } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: 'Secure Authentication',
      description: 'Auth0-powered login with industry-standard security'
    },
    {
      icon: <Monitor className="w-6 h-6 text-green-600" />,
      title: 'Multi-Device Management',
      description: 'Control and monitor sessions across all your devices'
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: 'Session Limits',
      description: 'Configurable concurrent device limits for enhanced security'
    },
    {
      icon: <Lock className="w-6 h-6 text-orange-600" />,
      title: 'Graceful Logout',
      description: 'Automatic session management with user-friendly notifications'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
            N-Device Login Manager
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4">
            Secure multi-device authentication system with intelligent session management.
            Control how many devices can access your account simultaneously.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 w-full sm:w-auto">
              <a href="/api/auth/login" className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Sign In
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild className="px-6 sm:px-8 py-3 w-full sm:w-auto">
              {/* screen_hint=signup opens hosted sign-up */}
              <a href="/api/auth/login?screen_hint=signup" className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Sign Up
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-6 sm:px-8 py-3 w-full sm:w-auto">
              <a href="#features" className="flex items-center justify-center gap-2">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                Learn More
              </a>
            </Button>
          </div>

          {/* Demo Credentials Section */}
          <div className="mt-8 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🧪 Try the Demo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test the multi-device functionality with our demo account
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">Email:</div>
                <div className="font-mono text-gray-900 break-all">epicmorse@heywhatsoup.com</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">Password:</div>
                <div className="font-mono text-gray-900">epicmorse@heywhatsoup.coM</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button size="sm" asChild className="bg-green-600 hover:bg-green-700 text-white">
                <a href="/api/auth/login" className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Try Demo Account
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
              <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  {feature.icon}
                </div>
                <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 text-center">
                <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl mb-2">Ready to Get Started?</CardTitle>
            <CardDescription className="text-blue-100 text-base sm:text-lg">
              Experience secure, intelligent session management today
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-4 sm:p-6 pt-0">
            <Button size="lg" variant="secondary" asChild className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
              <a href="/api/auth/login" className="flex items-center justify-center gap-2 mx-auto">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Sign In Now
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}