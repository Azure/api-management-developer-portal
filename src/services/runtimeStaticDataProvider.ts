import { HttpMethod } from "@paperbits/common/http";
import { XmlHttpRequestClient } from "@paperbits/common/http/xmlHttpRequestClient";
import { Logger } from "@paperbits/common/logging";
import IStaticDataProvider from "./IStaticDataProvider";

export class RuntimeStaticDataProvider implements IStaticDataProvider {
    private readonly httpClient: XmlHttpRequestClient;

    constructor(logger: Logger) {
        this.httpClient = new XmlHttpRequestClient(logger);
    }

    getStaticData(objectType: string): Promise<any> {
        let path = objectType == "defaultStaticData.json" ? "/tests/mocks/defaultStaticData.json" : "/editors/templates/default.json";

        return new Promise<any>(async (resolve, reject) => {
            let result = await this.httpClient.send({
                method: HttpMethod.get,
                url: path,
                headers: [],
                body: {}
            });
            resolve(result.toObject());
        });
    }
}