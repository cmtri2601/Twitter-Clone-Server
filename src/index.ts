import cors from 'cors';
import express from 'express';
import 'reflect-metadata';
import database from '~/database';
import { errorHandler } from '~/middlewares/handleApplicationError';
import morgan from '~/middlewares/morgan';
import route from '~/routes';
import corsOptions from './utils/Config/CorsOptions';
import { initFolder } from './utils/file';

// define variable
const app = express();
const port = process.env.PORT ?? 8080;

// init upload folder
initFolder();

// handle log
app.use(morgan);

// connect database
database.run().catch(console.dir);

// use cors
app.use(cors(corsOptions));

// express middleware
app.use(express.json());

// handle route
app.use('/api', route);

// handle error
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
