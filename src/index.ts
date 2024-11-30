import express from 'express';
import 'reflect-metadata';
import database from '~/database';
import { errorHandler } from '~/middlewares/handleApplicationError';
import route from '~/routes';

// define variable
const app = express();
const port = process.env.PORT ?? 8080;

// connect database
database.run().catch(console.dir);

// express middleware
app.use(express.json());

// handle route
app.use(route);

// handle error
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
