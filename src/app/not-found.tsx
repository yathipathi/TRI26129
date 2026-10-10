'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardFooter, Badge } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface flex flex-col justify-center items-center p-6 selection:bg-md-primary-container selection:text-md-on-primary-container">
      <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-md-2">
        <div className="w-14 h-14 rounded-md-full bg-md-error-container text-md-on-error-container mx-auto flex items-center justify-center font-bold">
          <AlertCircle className="w-8 h-8 text-md-error" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-center gap-2">
            <Badge variant="error">404 Not Found</Badge>
            <Badge variant="tonal">SiteForge Studio</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-md-on-surface">Page or Project Not Found</h1>
          <p className="text-xs text-md-on-surface-variant">
            The requested page does not exist or you do not have authorization to view this website project.
          </p>
        </div>

        <CardFooter className="justify-center border-t border-md-outline-variant/40 pt-4">
          <Link href="/">
            <Button variant="filled" className="font-semibold">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
