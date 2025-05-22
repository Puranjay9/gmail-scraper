import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(helmet());

app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api" , routes);

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});

export default app;