import express from 'express';
import {router} from "./router/log-router";
import {HttpError} from "./infra/error/error-classes";
import {errorHandler} from "./infra/error/error-handler";

const app = express();
const PORT = 8800;

app.use(express.json());

app.use('/logs', router);
app.all('/{*path}', (req, _res, next) => {
    next(new HttpError(404, `Router with Path '${req.originalUrl}' Not Found`));
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});