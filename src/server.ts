import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import { Cors } from './middleware/Cors';
import Logging from './library/Logging';
import Logger from './middleware/Logger';
import ErrorHandler from './middleware/ErrorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/Auth';
import userRoutes from './routes/User';
import activityRoutes from './routes/Activity';
import reportRoutes from './routes/Report';
import wishlistRoutes from './routes/Wishlist';
import { attachChat } from './services/ChatService';

const router = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo connected successfully.');
        StartServer();
    })
    .catch((error) => Logging.error(error));

/** Only Start Server if Mongoose Connects */
const StartServer = () => {
    router.use(Logger);

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());
    router.use(cookieParser());

    /** CORS */
    router.use(Cors);

    /** Routes */
    router.use('/auth', authRoutes);
    router.use('/users', userRoutes);
    router.use('/activities', activityRoutes);
    router.use('/reports', reportRoutes);
    router.use('/wishlists', wishlistRoutes);
    router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    /** Healthcheck */
    router.get('/ping', (req, res) => res.status(200).json({ hello: 'world' }));

    /** Error handling */
    router.use((req, res, next) => {
        next(new Error('Not found'));
    });

    router.use(ErrorHandler);

    const server = http.createServer(router);
    attachChat(server);
    server.listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
};
