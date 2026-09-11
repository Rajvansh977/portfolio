const token = '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';
const model = 'meta-llama/Llama-3.1-8B-Instruct';

for (const provider of ['featherless-ai', 'nscale']) {
  const res = await fetch(`https://router.huggingface.co/${provider}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: 'say hi in one sentence' }], max_tokens: 50, stream: false }),
  });
  const data = await res.json();
  console.log(`[${provider}] ${res.status}:`, data.choices?.[0]?.message?.content ?? JSON.stringify(data).slice(0,200));
}
