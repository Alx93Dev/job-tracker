// Minimal stand-in for the Claude Messages API so the end-to-end suite never calls (or pays
// for) the real model. It answers with fixed structured outputs that match the app's schemas.
import { createServer } from 'node:http';

const port = Number(process.argv[2] ?? 4199);

export const EXTRACTED_POSTING = {
  companyName: 'Globex',
  positionTitle: 'Senior React Developer',
  location: 'Madrid',
  workMode: 'HYBRID',
  salaryRange: '45k - 55k EUR',
  seniority: 'Senior',
  requiredSkills: ['React', 'TypeScript', 'Testing'],
  niceToHaveSkills: ['Next.js'],
  summary: 'Build and maintain the customer portal.',
};

export const CV_MATCH = {
  matchScore: 72,
  verdict: 'PARTIAL',
  strengths: ['Angular dashboard with TypeScript'],
  gaps: ['No production React experience'],
  talkingPoints: ['Lead with the job tracker built in React'],
  summary: 'Solid TypeScript base; React is the main gap.',
};

createServer(async (request, response) => {
  if (request.method !== 'POST') {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('ok');
    return;
  }

  let body = '';
  for await (const chunk of request) body += chunk;
  const payload = JSON.parse(body);
  const isExtraction = String(payload.system).includes('extract structured data');

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(
    JSON.stringify({
      id: 'msg_e2e',
      type: 'message',
      role: 'assistant',
      model: payload.model,
      content: [
        { type: 'text', text: JSON.stringify(isExtraction ? EXTRACTED_POSTING : CV_MATCH) },
      ],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    }),
  );
}).listen(port, '127.0.0.1');
