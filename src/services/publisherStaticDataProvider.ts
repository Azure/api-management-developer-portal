import path = require("path");
import  IStaticDataProvider  from "./IStaticDataProvider";
const fs = require("fs");

export class PublisherStaticDataProvider implements IStaticDataProvider {
    public getStaticData(objectType: string): Promise<any> {
        const fullPath = objectType == "defaultStaticData.json" ?
            path.join(__dirname, "../../tests/mocks/defaultStaticData.json") : path.join(__dirname, "../../templates/default.json");
        const filePath = path.resolve(fullPath);

        return new Promise<any>((resolve, reject) => {
            fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
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