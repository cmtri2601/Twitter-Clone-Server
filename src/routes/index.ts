import { Router } from 'express';
import userRoutes from '~/routes/user.route';
import exampleRoutes from './example.route';

const route = Router();

route.use('/example', exampleRoutes);
route.use('/users', userRoutes);

export default route;
