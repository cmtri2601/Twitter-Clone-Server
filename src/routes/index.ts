import { Router } from 'express';
import exampleRoutes from '~/routes/example.route';
import mediaRoutes from '~/routes/media.route';
import userRoutes from '~/routes/user.route';

const route = Router();

route.use('/example', exampleRoutes);
route.use('/users', userRoutes);
route.use('/media', mediaRoutes);

export default route;
