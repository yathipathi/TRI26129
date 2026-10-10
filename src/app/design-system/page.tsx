'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/theme-provider';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Chip,
  Input,
  TextField,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Switch,
  LinearProgress,
  Snackbar,
  Avatar,
  AvatarFallback,
} from '@/components/ui';

export default function DesignSystemPage() {
  const { themeMode, skin, resolvedTheme, setThemeMode, setSkin, toggleTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [activeChip, setActiveChip] = useState('Overview');

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface p-6 md:p-12 space-y-10">
      {/* Top Header / Control Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-md-outline-variant/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Design System Showcase</h1>
            <Badge variant="primary">{skin === 'material3' ? 'Material Design 3' : 'Microsoft Fluent 2'}</Badge>
            <Badge variant="tonal">{resolvedTheme.toUpperCase()}</Badge>
          </div>
          <p className="text-sm text-md-on-surface-variant mt-1">
            Single source of truth for SiteForge UI tokens, primitives, skins, and WCAG AA accessibility compliance.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-md-surface p-2 rounded-md-xl border border-md-outline-variant shadow-md-1">
          <Button
            variant={skin === 'material3' ? 'filled' : 'ghost'}
            size="sm"
            onClick={() => setSkin('material3')}
          >
            Material 3
          </Button>
          <Button
            variant={skin === 'fluent2' ? 'filled' : 'ghost'}
            size="sm"
            onClick={() => setSkin('fluent2')}
          >
            Fluent 2
          </Button>

          <div className="h-5 w-px bg-md-outline-variant/60 mx-1" />

          <Button variant="tonal" size="sm" onClick={toggleTheme}>
            {resolvedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Button>

          <select
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value as any)}
            className="text-xs bg-md-surface-container border border-md-outline-variant rounded-md-sm px-2 py-1.5 text-md-on-surface"
          >
            <option value="system">System Preference</option>
            <option value="light">Explicit Light</option>
            <option value="dark">Explicit Dark</option>
          </select>
        </div>
      </div>

      {/* Grid of Design Tokens & Primitives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Buttons & Floating Actions</h2>
            <p className="text-xs text-md-on-surface-variant">
              M3 Pill buttons with state layers vs Fluent 4px density
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="filled">Filled Button</Button>
              <Button variant="tonal">Tonal Button</Button>
              <Button variant="outlined">Outlined Button</Button>
              <Button variant="ghost">Text / Ghost</Button>
              <Button variant="fab">✨ FAB Action</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="filled" size="sm">Small</Button>
              <Button variant="filled" size="md">Medium</Button>
              <Button variant="filled" size="lg">Large</Button>
              <Button variant="filled" disabled>Disabled State</Button>
            </div>
          </CardContent>
        </Card>

        {/* Chips, Badges & Avatars */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Chips, Badges & User Icons</h2>
            <p className="text-xs text-md-on-surface-variant">Tonal containers & pill badges</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {['Overview', 'Performance', 'SEO', 'Security', 'Interactivity'].map((chip) => (
                <Chip key={chip} active={activeChip === chip} onClick={() => setActiveChip(chip)}>
                  {chip}
                </Chip>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary">Verified Working</Badge>
              <Badge variant="tonal">Evidence Sourced</Badge>
              <Badge variant="error">Audit Alert</Badge>
              <Badge variant="outline">Standalone ZIP</Badge>
            </div>

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>SF</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">SiteForge Workspace</p>
                <p className="text-xs text-md-on-surface-variant">user@siteforge.ai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Inputs & Text Fields */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Form Control Primitives</h2>
            <p className="text-xs text-md-on-surface-variant">Text fields, switches, progress indicators</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField
              label="Project Title"
              placeholder="e.g. Hyderabad Craft Bakery & Café"
              helperText="Auto-saved to your cloud workspace history"
            />

            <TextField
              label="Target Niche & Competitors"
              placeholder="e.g. Organic Artisan Coffee"
              error={false ? 'Error message example' : undefined}
            />

            <div className="flex items-center justify-between pt-2">
              <Switch
                checked={switchState}
                onChange={setSwitchState}
                label="Automated Crawlers & Click-Test Verification"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span>AI Pipeline Generation Progress</span>
                <span>78%</span>
              </div>
              <LinearProgress value={78} />
            </div>
          </CardContent>
        </Card>

        {/* Tabs, Dialog & Feedback */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Navigation Tabs & Dialogs</h2>
            <p className="text-xs text-md-on-surface-variant">Segmented tabs and modal surface windows</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="editor">
              <TabsList>
                <TabsTrigger value="editor">Visual Editor</TabsTrigger>
                <TabsTrigger value="code">Raw Spec JSON</TabsTrigger>
                <TabsTrigger value="history">Version History</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="p-4 bg-md-surface-container rounded-md-md text-xs">
                Zero-collateral section editor is currently active. Every change is isolated and byte-verified.
              </TabsContent>
              <TabsContent value="code" className="p-4 bg-md-surface-container rounded-md-md text-xs font-mono">
                {`{ "specVersion": "1.0.0", "theme": { "primaryColor": "#0b57d0" } }`}
              </TabsContent>
              <TabsContent value="history" className="p-4 bg-md-surface-container rounded-md-md text-xs">
                v1.2.0 - Verified working commit (Playwright 12/12 passed)
              </TabsContent>
            </Tabs>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outlined" onClick={() => setDialogOpen(true)}>
                Open Modal Dialog
              </Button>
              <Button variant="tonal" onClick={() => setSnackbarOpen(true)}>
                Trigger Snackbar Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Material 3 Surface Dialog</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4 text-sm">
            <p>
              This dialog demonstrates the 28px rounded surface container, dark backdrop blur filter, and focus management.
            </p>
            <TextField label="Confirmation Notes" placeholder="Enter notes..." />
          </div>
          <CardFooter className="justify-end gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="filled" onClick={() => setDialogOpen(false)}>
              Confirm Action
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        message="SiteForge changes published successfully to production."
        actionLabel="View Details"
        onAction={() => alert('Viewing details')}
        onClose={() => setSnackbarOpen(false)}
      />
    </div>
  );
}
