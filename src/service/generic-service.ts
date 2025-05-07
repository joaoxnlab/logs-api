import {DB_PATH, read, removeFromDB} from "../utils/files";
import { type Database, type DTO, type Entity, Raw } from "../datasource/entity/entities";
import { HttpError } from "../infra/error/error-classes";


interface EntityConstructor<T> {
    new(...args: any[]): T;
    fromObjectAsync(obj: DTO<T>): Promise<T>;
    fromObject(uuid: string, _obj: DTO<T>): T;
    dbKey: keyof Database;
}

export class GenericService<T extends Entity> {
    constructor(private EntityConstructor: EntityConstructor<T>) {}

    async getAll(): Promise<Raw<T>[]> {
        const rawDB: Raw<Database> = await read<Raw<Database>>(DB_PATH, JSON.parse);
        return rawDB[this.EntityConstructor.dbKey] as unknown as Raw<T>[];
    }

    async get(uuid: string): Promise<Raw<T>> {
        const entities = await this.getAll();

        const index = entities.findIndex((entity) => entity.uuid === uuid);
        if (index === -1)
            throw new HttpError(404, `No Entity found with uuid '${uuid}'`);

        return entities[index];
    }

    async add(entityDTO: DTO<T>): Promise<T> {
        const entity = await this.EntityConstructor.fromObjectAsync(entityDTO);
        await entity.saveToDB();
        return entity;
    }

    async put(uuid: string, entityDTO: DTO<T>): Promise<T> {
        await removeFromDB(uuid, this.EntityConstructor.dbKey);
        const entity = this.EntityConstructor.fromObject(uuid, entityDTO);
        await entity.saveToDB();
        return entity;
    }

    async remove(uuid: string): Promise<T> {
        const entity = this.EntityConstructor.fromObject(uuid, await this.get(uuid));
        await entity.removeFromDB();
        return entity;
    }
}
