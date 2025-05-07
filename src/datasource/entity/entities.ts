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

type Database = {
    logs: Log[]
}

type DTO<T> = Omit<Raw<T>, 'id'>;

type Primitive = 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function';

function assertPropertyValue(obj: unknown, key: string | number, value: unknown) {
    if (typeof obj !== 'object' || obj === null)
        throw new TypeError("Value is not of type OBJECT or is equal to null");

    if (!(key in obj)) throw new TypeError(
        `Missing property '${key}' of type '${typeof value}' and value '${String(value)}'`
    );

    const valueFromObj = (obj as object & {[key]: unknown})[key];

    if (valueFromObj !== value) throw new TypeError(
        `Expected property '${key}' with type '${typeof value}' and value '${String(value)}'.`
        +` Received with type: '${typeof valueFromObj}' and value '${valueFromObj}'`
    );
}

function assertPropertyType(obj: unknown, key: string | number, typeOrUnion: Primitive[] | Primitive) {
    let typeVisualization: string;
    if (typeof typeOrUnion === 'string') typeVisualization = typeOrUnion;
    else typeVisualization = typeOrUnion.join(' | ');

    if (typeof obj !== 'object' || obj === null)
        throw new TypeError("Value is not of type OBJECT or is equal to null");

    if (!(key in obj)) throw new TypeError(`Missing property '${key}' of type '${typeVisualization}'`);

    const objType = typeof (obj as object & {[key]: unknown})[key];

    let hasCorrectType;
    if (typeof typeOrUnion === 'string') hasCorrectType = objType === typeOrUnion;
    else hasCorrectType = typeOrUnion.includes(objType);

    if (!hasCorrectType) throw new TypeError(
        `Expected property '${key}' with type '${typeVisualization}'. Received with type: '${objType}'`
    );
}

class Value {
    data: unknown;
    primitiveType: Primitive;
    constructor(data: unknown) {
        this.data = data;
        this.primitiveType = typeof data;
    }
}

/**
 * Asserts `obj` is an object and has properties with types and values according to `schema`.
 *
 * @param obj - Object with propertiees to be asserted.
 * @param schema - Use the schema to dictate how to check for the type of `obj`.
 * <br/> - Put the keys that the object has to check for those keys;
 * <br/> - Put the value as a `Primitive` (string with name of a primitive type) to check for the primitive type;
 * <br/> - Put the value as an instance of Value to compare the exact values of `obj[key]` and `Value.data`.
 */
function assertPropertiesByValueAndPrimitiveType(obj: unknown, schema: {[key: string | number]: Primitive | Value}) {
    for (const key in schema) {
        const value = schema[key];
        if (value instanceof Value)
            assertPropertyValue(obj, key, value);
        else assertPropertyType(obj, key, value);
    }
}

abstract class Entity {
    uuid?: string;

    abstract dbKey(): keyof Database;

    protected constructor(id?: string) {
        this.uuid = id;
    }

    async generateID() {
        this.uuid = v4();
        return this;
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

    static fromObject(_id: string, _obj: Record<string, unknown>) {
        throw new Error("Method not implemented! Use derived class");
    }

    static assertValidDTO(_obj: unknown) {
        throw new Error("Method not implemented! Use derived class");
    }
}

class Log extends Entity {
    date: Date;
    name: string;

    static readonly dbKey: keyof Database = "logs";

    constructor(name: string, uuid?: string) {
        super(uuid);
        this.date = new Date();
        this.name = name;
    }

    dbKey(): keyof Database {
        return "logs";
    }

    toString() {
        return `${this.uuid} - ${this.date} - ${this.name}`;
    }

    static async fromObjectAsync(obj: DTO<Log>) {
        return new Log(obj.name).generateID();
    }

    static fromObject(id: string, obj: DTO<Log>) {
        return new Log(obj.name, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Log> {
        const schema: {[key: string | number]: Primitive | Value} = {
            name: 'string'
        }
        assertPropertiesByValueAndPrimitiveType(obj, schema);
    }
}
