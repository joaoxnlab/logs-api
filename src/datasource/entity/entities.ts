import {v4} from "uuid";

export { Raw, DTO, Database, Log };

type Raw<T> =
    T extends Function ? never :
        T extends Array<infer U> ? Raw<U>[] :
            T extends object ? {
                    [K in keyof T as T[K] extends Function ? never : K]: Raw<T[K]>;
                } :
                T;

type DTO<T> = Omit<Raw<T>, 'id'>;

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
