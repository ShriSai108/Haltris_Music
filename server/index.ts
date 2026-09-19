import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerContactRoute } from './contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 3000);
const clientDirectory = path.resolve(__dirname, '../dist');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
registerContactRoute(app);
app.use(express.static(clientDirectory));
app.get('/*splat', (_request, response) => {
  response.sendFile(path.join(clientDirectory, 'index.html'));
});

app.listen(port, () => {
  console.log(`Haltris server listening on port ${port}`);
});

export { app };
