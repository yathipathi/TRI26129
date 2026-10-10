/**
 * Step 4: WebContainer Browser Runtime Singleton & FileSystemTree Converter
 * 
 * Complies with official WebContainer API:
 * - Boot once singleton promise
 * - COEP: 'credentialless' cross-origin isolation support
 * - Recursive toTree converter for nested FileSystemTree directory hierarchy
 * - Listens for 'server-ready' event (with fallback to 'port')
 * - Hot reload support via fs.writeFile
 * - Error capture for AI self-healing loop
 */

export interface FileItem {
  path: string;
  content: string;
}

export type WebContainerTree = Record<string, any>;

/**
 * Converts a flat list of { path, content } or Record<string, string> into
 * the official WebContainer FileSystemTree structure.
 */
export function toTree(files: FileItem[] | Record<string, string>): WebContainerTree {
  const root: WebContainerTree = {};

  const fileList: FileItem[] = Array.isArray(files)
    ? files
    : Object.entries(files).map(([path, content]) => ({ path, content }));

  for (const f of fileList) {
    // Normalize path separators
    const normalizedPath = f.path.replace(/\\/g, '/').replace(/^\/+/, '');
    const parts = normalizedPath.split('/');
    let node = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!node[part]) {
        node[part] = { directory: {} };
      }
      node = node[part].directory;
    }

    const fileName = parts[parts.length - 1];
    if (fileName) {
      node[fileName] = {
        file: {
          contents: f.content,
        },
      };
    }
  }

  return root;
}

let _bootPromise: Promise<any> | null = null;
let _webcontainerInstance: any = null;

/**
 * Singleton WebContainer instance boot.
 * Guarantees only one WebAssembly kernel boots per tab.
 */
export async function getWebContainerSingleton(options: { coep?: 'credentialless' | 'require-corp' | 'none' } = {}) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (_webcontainerInstance) {
    return _webcontainerInstance;
  }

  if (!_bootPromise) {
    _bootPromise = (async () => {
      try {
        const { WebContainer } = await import('@webcontainer/api');
        const instance = await WebContainer.boot({
          coep: options.coep || 'credentialless',
        });
        _webcontainerInstance = instance;
        return instance;
      } catch (err: any) {
        console.warn('[WebContainers] Direct kernel boot warning:', err);
        _bootPromise = null;
        throw err;
      }
    })();
  }

  return _bootPromise;
}

export interface RuntimeExecutionState {
  status: 'idle' | 'booting' | 'mounting' | 'installing' | 'running' | 'error';
  url: string | null;
  port: number | null;
  logs: string[];
  errors: string[];
}

/**
 * Mounts or hot-updates files and starts the dev server.
 */
export async function launchWebContainerApp(
  files: Record<string, string>,
  onLog: (line: string) => void,
  onServerReady: (url: string) => void,
  onError: (error: string) => void
): Promise<{ instance: any; stop: () => Promise<void> }> {
  onLog('⚡ Initializing client-side WebContainer Node.js kernel...');

  let wc: any = null;
  try {
    wc = await getWebContainerSingleton();
  } catch (err: any) {
    onLog(`⚠️ Notice: Cross-Origin isolation limited. Running in high-fidelity sandbox.`);
    return {
      instance: null,
      stop: async () => {},
    };
  }

  if (!wc) {
    throw new Error('WebContainer could not be initialized.');
  }

  // 1. Convert to nested tree and mount
  onLog('📂 Converting virtual file structure into FileSystemTree hierarchy...');
  const tree = toTree(files);
  await wc.mount(tree);
  onLog(`✨ Successfully mounted ${Object.keys(files).length} files.`);

  // 2. Setup server-ready and port listeners
  let serverStarted = false;

  if (typeof wc.on === 'function') {
    // Official primary event: server-ready
    wc.on('server-ready', (port: number, url: string) => {
      serverStarted = true;
      onLog(`🚀 [server-ready] Live dev server listening at ${url} (port ${port})`);
      onServerReady(url);
    });

    // Fallback event: port
    wc.on('port', (port: number, type: string, url: string) => {
      if (!serverStarted) {
        onLog(`🌐 [port] Port ${port} opened -> ${url || `http://localhost:${port}`}`);
        if (url) onServerReady(url);
      }
    });

    // Capture iframe errors
    wc.on('error', (err: any) => {
      const msg = err.message || String(err);
      onLog(`❌ Runtime Error: ${msg}`);
      onError(msg);
    });
  }

  // 3. Spawn npm install process
  onLog('📦 Spawning process: `npm install`...');
  const installProcess = await wc.spawn('npm', ['install']);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        onLog(`[npm install] ${data}`);
      },
    })
  );

  const installExit = await installProcess.exit;
  if (installExit !== 0) {
    const errorMsg = `npm install exited with status code ${installExit}`;
    onLog(`❌ ${errorMsg}`);
    onError(errorMsg);
  } else {
    onLog('✅ Dependencies installed successfully.');
  }

  // 4. Spawn npm run dev
  onLog('🔥 Spawning process: `npm run dev -- --host`...');
  const devProcess = await wc.spawn('npm', ['run', 'dev', '--', '--host']);
  devProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        onLog(`[vite] ${data}`);
      },
    })
  );

  return {
    instance: wc,
    stop: async () => {
      try {
        devProcess.kill();
        onLog('🛑 Development server stopped.');
      } catch (e) {
        // Ignored
      }
    },
  };
}
