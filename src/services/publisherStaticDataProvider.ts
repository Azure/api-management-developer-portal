import path = require("path");
import  IStaticDataProvider  from "./IStaticDataProvider";
const fs = require('fs');

export class PublisherStaticDataProvider implements IStaticDataProvider {
    getStaticData(objectType: string): Promise<any> {
        let fullPath = objectType == "defaultMockData.json" ?
            path.join(__dirname, '../../tests/mocks/defaultMockData.json') : path.join(__dirname, '../../templates/default.json');
        let filePath = path.resolve(fullPath);

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