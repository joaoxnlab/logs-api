import  * as files from "../utils/files";
import {Database, Log, Raw} from "../datasource/entity/entities";
import {HttpError} from "../infra/error/error-classes";

async function create(name: string) {
    const log = new Log(name);
    const data: Database = await files.read(files.DB_PATH, JSON.parse);
    data.logs.push(log);
    await files.write(files.DB_PATH, JSON.stringify(data));
}

async function get(uuid: string) {
    const data = await files.read<Raw<Database>>(files.DB_PATH, JSON.parse);
    const log: Raw<Log> = data.logs.filter(e => e.uuid === uuid)[0];
    if (!log) throw new HttpError(404, `Entity with such ID not found. (${uuid})`);
    return log;
}
