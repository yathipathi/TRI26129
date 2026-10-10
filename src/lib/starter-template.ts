/**
 * Step 3: Design System Starter Template & Component Allow-List
 * 
 * Guarantees that imports like `@/components/ui/button` ALWAYS resolve to physical files
 * inside the virtual project tree, preventing runtime Vite bundling errors.
 */

export const UI_COMPONENT_ALLOWLIST = [
  'button',
  'card',
  'badge',
  'input',
  'label',
  'tabs',
  'dialog',
  'avatar',
  'separator',
];

export const STARTER_UI_COMPONENTS: Record<string, string> = {
  'src/components/ui/button.jsx': `import React from 'react';

export function Button({ variant = 'default', size = 'md', children, className = '', ...props }) {
  const variantClasses = {
    default: 'bg-black text-white hover:bg-neutral-800 border border-black',
    outline: 'bg-white text-black hover:bg-neutral-50 border border-black',
    ghost: 'bg-transparent text-black hover:bg-neutral-100 border border-transparent',
  }[variant] || 'bg-black text-white border border-black';
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size] || 'px-4 py-2 text-sm';
  return (
    <button
      className={\`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 \${variantClasses} \${sizeClasses} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
}
`,

  'src/components/ui/card.jsx': `import React from 'react';

export function Card({ children, className = '' }) {
  return <div className={\`border border-black bg-white \${className}\`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={\`p-4 border-b border-black \${className}\`}>{children}</div>;
}
export function CardContent({ children, className = '' }) {
  return <div className={\`p-4 \${className}\`}>{children}</div>;
}
export function CardFooter({ children, className = '' }) {
  return <div className={\`p-4 border-t border-black \${className}\`}>{children}</div>;
}
`,

  'src/components/ui/badge.jsx': `import React from 'react';

export function Badge({ children, className = '' }) {
  return (
    <span className={\`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border border-black bg-white text-black \${className}\`}>
      {children}
    </span>
  );
}
`,

  'src/components/ui/input.jsx': `import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={\`w-full px-3 py-2 border border-black bg-white text-black text-sm font-mono outline-none focus:ring-1 focus:ring-black \${className}\`}
      {...props}
    />
  );
}
`,

  'src/components/ui/tabs.jsx': `import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext({ active: '', setActive: () => {} });

export function Tabs({ defaultValue, children, className = '' }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}
export function TabsList({ children, className = '' }) {
  return <div className={\`flex border-b border-black \${className}\`}>{children}</div>;
}
export function TabsTrigger({ value, children, className = '' }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      onClick={() => setActive(value)}
      className={\`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 \${
        active === value
          ? 'border-black text-black bg-neutral-50'
          : 'border-transparent text-neutral-500 hover:text-black hover:bg-neutral-50'
      } \${className}\`}
    >
      {children}
    </button>
  );
}
export function TabsContent({ value, children, className = '' }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
}
`,

  'src/components/ui/dialog.jsx': `import React from 'react';

export function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-black max-w-xl w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {children}
      </div>
    </div>
  );
}
`,
};

export const BASE_VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
`;
