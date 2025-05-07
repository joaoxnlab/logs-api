import {v4} from "uuid";
import * as files from "../../utils/files";

export { Raw, DTO, Database, Log, Entity };

type Raw<T> =
    T extends Function ? never :
        T extends Array<infer U> ? Raw<U>[] :
            T extends object ? {
                    [K in keyof T as T[K] extends Function ? never : K]: Raw<T[K]>;
                } :
                T;

type DTO<T> = Omit<Raw<T>, 'id'>;

abstract class Entity {
    uuid?: string;

    abstract dbKey(): keyof Database;

    protected constructor(id?: string) {
        this.uuid = id;
    }

    async generateID() {
        return v4();
    }

    async saveToDB() {
        if (!this.uuid) throw new Error("ID is required to save the Entity to the Database");
        const db = await files.read(files.DB_PATH, JSON.parse) as Database;
        (db[this.dbKey()] as unknown as typeof this[]).push(this);

        await files.write(files.DB_PATH, JSON.stringify(db));
    }

    async removeFromDB() {
        if (!this.uuid) throw new Error("ID is required to remove the Entity from the Database");
        return files.removeFromDB(this.uuid, this.dbKey());
    }

    static async fromObjectAsync(_object: Record<string, unknown>): Promise<Entity> {
        throw new Error("Method not implemented! Use derived class")
    }

    static fromObject(_id: number, _obj: Record<string, unknown>) {
        throw new Error("Method not implemented! Use derived class");
    }

    static assertValidDTO(_obj: unknown) {
        throw new Error("Method not implemented! Use derived class");
    }
}

class Log {
    uuid: string;
    date: Date;
    name: string;

    constructor(name: string) {
        this.uuid = v4();
        this.date = new Date();
        this.name = name;
    }

    toString() {
        return `${this.uuid} - ${this.date} - ${this.name}`;
    }
}


type Database = {
    logs: Log[]
}

type Primitive = 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function';
