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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            N-Device Login Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Secure multi-device authentication system with intelligent session management.
            Control how many devices can access your account simultaneously.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              <a href="/api/auth/login" className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sign In
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild className="px-8 py-3">
              {/* screen_hint=signup opens hosted sign-up */}
              <a href="/api/auth/login?screen_hint=signup" className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sign Up
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8 py-3">
              <a href="#features" className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Learn More
              </a>
            </Button>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Ready to Get Started?</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Experience secure, intelligent session management today
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" variant="secondary" asChild className="bg-white text-blue-600 hover:bg-gray-100">
              <a href="/api/auth/login" className="flex items-center gap-2 mx-auto">
                <Shield className="w-5 h-5" />
                Sign In Now
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}