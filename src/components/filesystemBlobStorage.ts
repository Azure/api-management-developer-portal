import * as fs from "fs";
import * as path from "path";
import * as mkdirp from "mkdirp";
import { IBlobStorage } from "@paperbits/common/persistence";

export class FileSystemBlobStorage implements IBlobStorage {
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    public uploadBlob(blobPath: string, content: Uint8Array): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const fullpath = `${this.basePath}/${blobPath}`.replace("//", "/");

            mkdirp(path.dirname(fullpath), (error) => {
                if (error) {
                    reject(error);
                    throw error;
                }
                else {
                    fs.writeFile(fullpath, Buffer.from(content), error => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                }
            });
        });
    }

    public downloadBlob(blobPath: string): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            const fullpath = `${this.basePath}/${blobPath}`.replace("//", "/");

            fs.readFile(fullpath, (error, buffer: Buffer) => {
                if (error) {
                    reject(error);
                    return;
                }

                const arrayBuffer = new ArrayBuffer(buffer.length);
                const unit8Array = new Uint8Array(arrayBuffer);

                for (let i = 0; i < buffer.length; ++i) {
                    unit8Array[i] = buffer[i];
                }

                resolve(unit8Array);
            });
        });
    }

    public async listBlobs(): Promise<string[]> {
        const files = this.listAllFilesInDirectory(this.basePath);
        if (files.length > 0) {
            return files.map(file => file.split(this.basePath).pop());
        }
        return [];
    }

    private listAllFilesInDirectory(dir: string): string[] {
        const results = [];

        fs.readdirSync(dir).forEach((file) => {
            file = dir + "/" + file;
            const stat = fs.statSync(file);

            if (stat && stat.isDirectory()) {
                results.push(...this.listAllFilesInDirectory(file));
            } else {
                results.push(file);
            }

        });

        return results;
    }

    public getDownloadUrl(filename: string): Promise<string> {
        throw new Error("Not supported");
    }

    public async deleteBlob(filename?: string): Promise<void> {
        const deletePath = filename && `${this.basePath}/${filename}`.replace("//", "/") || this.basePath;
        if (fs.existsSync(deletePath)) {
            if (fs.lstatSync(deletePath).isFile()) {
                fs.unlinkSync(deletePath);
            } else {
                this.deleteFolderRecursive(deletePath);
            }
        }
    }

    private deleteFolderRecursive(path: string) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file) => {
                const curPath = path + "/" + file;

                if (fs.lstatSync(curPath).isDirectory()) { // recurse      
                    this.deleteFolderRecursive(curPath);
                } else { // delete file      
                    fs.unlinkSync(curPath);
                }
            });

            fs.rmdirSync(path);
        }
    }
}