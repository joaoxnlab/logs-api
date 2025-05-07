import express from "express";
import * as Log from "../controller/controller";

export const router = express.Router();

router.get('', Log.getAll);
router.get('/:id', Log.get);
router.post('', Log.post);
router.put('/:id', Log.put);
router.delete('/:id', Log.remove);
