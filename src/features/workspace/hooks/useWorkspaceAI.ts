const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/workspace-ai`;
const AUTH_HEADER = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
  "Content-Type": "application/json",
};

export async function callAI(body: any): Promise<string> {
  try {
    const resp = await fetch(AI_URL, { method: "POST", headers: AUTH_HEADER, body: JSON.stringify(body) });
    if (!resp.ok) throw new Error("AI unavailable");
    const data = await resp.json();
    return data.result || "";
  } catch { return ""; }
}

export async function translateText(text: string, lang: string): Promise<string> {
  return callAI({ action: "translate", content: text, targetLanguage: lang });
}

export async function streamAI(
  messages: { role: string; content: string }[],
  onDelta: (chunk: string) => void,
  onDone: () => void,
) {
  try {
    const resp = await fetch(AI_URL, {
      method: "POST", headers: AUTH_HEADER,
      body: JSON.stringify({ messages }),
    });
    if (!resp.ok || !resp.body) { onDelta("Sorry, AI is unavailable right now."); onDone(); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { buffer = line + "\n" + buffer; break; }
      }
    }
  } catch { onDelta("Something went wrong. Please try again."); }
  onDone();
}
