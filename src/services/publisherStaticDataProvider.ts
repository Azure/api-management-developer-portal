import path = require("path");
import { IStaticDataProvider } from "./IStaticDataProvider";
const fs = require('fs');

export class PublisherStaticDataProvider implements IStaticDataProvider {
    getStaticData(): Promise<any> {
        let fullPath = path.join(__dirname, '\\..\\..\\tests\\mocks\\defaultMockData.json');
        let filePath = path.resolve(fullPath);
        console.log(`fullPath: ${fullPath} and filepath: ${filePath}`);

        return new Promise<any>((resolve, reject) => {
            fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
                if (err) {
                    reject();
                    return;
                }

                const obj = JSON.parse(data);
                resolve(obj);
            });

        });
    }
}