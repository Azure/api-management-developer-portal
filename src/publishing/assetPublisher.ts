import * as fs from "fs";
import * as path from "path";
import { IPublisher } from "@paperbits/common/publishing";
import { IBlobStorage } from "@paperbits/common/persistence";


const assetsBaseBath = path.resolve(__dirname, "./assets");

export class AssetPublisher implements IPublisher {
    constructor(private readonly outputBlobStorage: IBlobStorage) {
        console.log(assetsBaseBath);
    }

    private async copyAssetFrom(assetPath: string): Promise<void> {
        try {
            const byteArray = await this.downloadBlob(assetPath);
            await this.outputBlobStorage.uploadBlob(assetPath, byteArray);
        }
        catch (error) {
            console.log(assetPath + " assets error:" + error);
        }
    }

    private async copyAssets(): Promise<void> {
        const assetPaths = await this.listAssests();

        if (assetPaths.length > 0) {
            const copyPromises = assetPaths.map(assetPath => this.copyAssetFrom(assetPath));
            await Promise.all(copyPromises);
        }
    }

    public async listAssests(): Promise<string[]> {
        const files = this.listAllFilesInDirectory(assetsBaseBath);

        if (files.length > 0) {
            return files.map(file => file.split(assetsBaseBath).pop());
        }
        return [];
    }

    private downloadBlob(blobPath: string): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            const fullpath = `${assetsBaseBath}/${blobPath}`.replace("//", "/");

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

    public async publish(): Promise<void> {
        await this.copyAssets();
    }
}