import express from "express";
import * as Log from "../controller/controller";

export const studentRouter = express.Router();

studentRouter.get('', Log.getAll);
studentRouter.get('/:id', Log.get);
studentRouter.post('', Log.post);
studentRouter.put('/:id', Log.put);
studentRouter.delete('/:id', Log.remove);
