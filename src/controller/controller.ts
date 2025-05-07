import type { Request, Response } from "express";

import { type DTO, type Raw, Log } from "../datasource/entity/entities";
import { HttpError, HttpErrorHandler } from "../infra/error/error-classes";
import { GenericService } from "../service/generic-service";

export { getAll, get, post, put, remove };


type ErrorHandled<T> = T | HttpErrorHandler;

type HandledRawList = ErrorHandled<Raw<Log[]>>;
type HandledRaw = ErrorHandled<Raw<Log>>

type Body = Record<string, unknown> | undefined;

type GetAllRequest = Request<{}, HandledRawList>;
type GetRequest = Request<{ id: string }, HandledRaw>;
type PostRequest = Request<{}, HandledRaw, Body>;
type PutRequest = Request<{ id: string }, HandledRaw, Body>;
type DeleteRequest = Request<{ id: string }, HandledRaw>;

type LogListResponse = Response<HandledRawList>;
type LogResponse = Response<HandledRaw>;


const service = new GenericService<Log>(Log);

function idFromPathParams(req: Request<{ id: string }>, _res: unknown) {
    const id = req.params.id;

    if (!id) throw new HttpError(
        400,
        `'id' path parameter must be a valid string. Received: ${req.params.id}`
    );

    return id;
}

function assertValidDTO(body: Body): asserts body is DTO<Log> {
    try {
        Log.assertValidDTO(body);
    } catch (err: unknown) {
        if (err instanceof TypeError)
            throw new HttpError(400, `Invalid Log DTO format: ${err.message}`, err);
        throw err;
    }
}

async function getAll(_req: GetAllRequest, res: LogListResponse) {
    const Logs = await service.getAll();
    res.status(200).json(Logs);
}

async function get(req: GetRequest, res: LogResponse) {
    const id = idFromPathParams(req, res);
    res.status(200).json(await service.get(id));
}

async function post(req: PostRequest, res: LogResponse) {
    assertValidDTO(req.body);

    const newLog = await service.add(req.body);
    res.status(201).json(newLog);
}

async function put(req: PutRequest, res: LogResponse) {
    const id = idFromPathParams(req, res);
    assertValidDTO(req.body);

    const Log = await service.put(id, req.body);
    res.status(200).json(Log);
}

async function remove(req: DeleteRequest, res: LogResponse) {
    const id = idFromPathParams(req, res);
    const Log = await service.remove(id);
    res.status(200).json(Log);
}
