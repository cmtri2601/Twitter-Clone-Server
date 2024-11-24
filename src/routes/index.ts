import { Router } from 'express';
import userRoutes from '~/routes/user.route';

const route = Router();

route.use('/users', userRoutes);

export default route;
