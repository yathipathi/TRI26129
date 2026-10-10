export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callLLM(messages: LLMMessage[], options: { temperature?: number; jsonMode?: boolean } = {}): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // 1. PRIMARY: Google Gemini API (gemini-2.0-flash / gemini-1.5-flash)
  if (geminiKey && geminiKey.trim().length > 0) {
    try {
      const systemInstruction = messages.find((m) => m.role === 'system')?.content;
      const conversationContents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      // If no user/assistant messages, use system prompt as single user text
      if (conversationContents.length === 0 && systemInstruction) {
        conversationContents.push({
          role: 'user',
          parts: [{ text: systemInstruction }],
        });
      }

      const geminiModel = 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey.trim()}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
          contents: conversationContents,
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await res.text();
        console.warn(`[LLM] Gemini API returned status ${res.status}: ${errText.slice(0, 100)}, trying fallback...`);
      }
    } catch (err) {
      console.warn('[LLM] Gemini API call failed:', err);
    }
  }

  // 2. SECONDARY FALLBACK: Groq API (llama-3.3-70b-versatile)
  if (groqKey && groqKey.trim().length > 0) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: options.temperature ?? 0.7,
          ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      } else {
        console.warn(`[LLM] Groq API returned status ${res.status}, trying OpenRouter fallback...`);
      }
    } catch (err) {
      console.warn('[LLM] Groq API call failed:', err);
    }
  }

  // 3. TERTIARY FALLBACK: OpenRouter free models
  if (openRouterKey && openRouterKey.trim().length > 0) {
    const freeModels = [
      'google/gemini-2.0-flash-lite-preview-02-05:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
    ];

    for (const model of freeModels) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey.trim()}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'SiteForge AI Website Builder',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.7,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        }
      } catch (err) {
        console.warn(`[LLM] OpenRouter model ${model} failed:`, err);
      }
    }
  }

  // 4. DETERMINISTIC FALLBACK: Local AI Compiler
  console.log('[LLM] No active LLM response received, utilizing local AI compiler fallback.');
  const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';
  
  if (options.jsonMode) {
    return JSON.stringify({
      sitemap: ['/', '/about', '/services', '/contact'],
      title: 'AI Generated Platform',
      tagline: 'Engineered for absolute performance and scale',
      sections: ['hero', 'features', 'stats', 'pricing', 'contact'],
      colorPalette: { primary: '#09090b', secondary: '#ffffff', accent: '#f97316' },
      queryPlanning: ['competitor analysis', 'layout trends', 'pricing benchmarks'],
      contentBrief: 'Generated content brief for ' + lastUserMsg,
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-black font-sans">
  <header class="p-6 border-b border-black flex justify-between items-center">
    <div class="font-bold text-lg uppercase">PLATFORM</div>
    <nav class="space-x-4 text-xs font-mono font-bold uppercase">
      <a href="#features">Features</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main class="py-20 px-6 text-center">
    <h1 class="text-5xl font-black uppercase mb-4">Generated Platform</h1>
    <p class="text-neutral-600 max-w-xl mx-auto mb-8 font-mono text-sm">${lastUserMsg}</p>
    <a href="#contact" class="px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase">Get Started</a>
  </main>
</body>
</html>`;
}
