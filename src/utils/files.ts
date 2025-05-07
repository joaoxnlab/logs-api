import fs from "fs";
import {Database, Entity, Raw} from "../datasource/entity/entities";
import {HttpError} from "../infra/error/error-classes";

export { read, write, removeFromDB };

export const DB_PATH = "./datasource/repository/logs.json";
export const FILE_ENCODING = "utf8";
function read<T>(file: fs.PathOrFileDescriptor,
                 parser: (data: string) => T): Promise<T> {
    return new Promise((resolve, reject) => {
        fs.readFile(file, FILE_ENCODING, (err, data) => {
            if (err) return reject(err);
            const parsed = parser(data);
            return resolve(parsed);
        });
    });
}

function write(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, FILE_ENCODING, (err) => {
            if (err) return reject(err);
            return resolve();
        });
    });
}

async function removeFromDB(uuid: string, dbKey: keyof Database) {
    if (!uuid) throw new Error("ID is required to save the Entity to the Database");
    const db = await read<Raw<Database>>(DB_PATH, JSON.parse);

    const list = db[dbKey] as Raw<Entity>[];
    const index = list.findIndex(value=> value.uuid === uuid);
    if (index === -1)
        throw new HttpError(404, `No entity found with ID '${uuid}'`);

    const deletedEntity = list[index];
    list.splice(index, 1);
    await write(DB_PATH, JSON.stringify(db));

    return deletedEntity;
}
