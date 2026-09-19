import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 3000);
const clientDirectory = path.resolve(__dirname, '../dist');

app.use(express.json());
app.post('/api/contact', (_request, response) => {
  response.status(501).json({
    ok: false,
    message: 'Contact handling is not configured yet.',
  });
});
app.use(express.static(clientDirectory));
app.get('/*splat', (_request, response) => {
  response.sendFile(path.join(clientDirectory, 'index.html'));
});

app.listen(port, () => {
  console.log(`Haltris server listening on port ${port}`);
});

export { app };
