import express, { Request, Response } from "express";
import txnFeeRouter from './routes/txnfeeRoutes';

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/txnfee', txnFeeRouter);

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));


