import 'dotenv/config';
const token = process.env.HF_TOKEN;
console.log('Token:', token ? token.slice(0,8)+'...' : 'MISSING');

const models = [
  'meta-llama/Llama-3.2-3B-Instruct',
  'HuggingFaceH4/zephyr-7b-beta',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'Qwen/Qwen2.5-72B-Instruct',
];

for (const model of models) {
  const res = await fetch(
    `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 10 }),
    }
  );
  const body = await res.text();
  console.log(model, '->', res.status, body.slice(0,80));
}
