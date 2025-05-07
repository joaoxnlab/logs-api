import fs from "fs";

export { read, write };

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

function write(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView): Promise<null> {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, FILE_ENCODING, (err) => {
            if (err) return reject(err);
            return resolve(null);
        });
    });
}
