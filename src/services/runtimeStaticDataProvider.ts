import { HttpMethod } from "@paperbits/common/http";
import { XmlHttpRequestClient } from "@paperbits/common/http/xmlHttpRequestClient";
import { IStaticDataProvider } from "./IStaticDataProvider";

export class RuntimeStaticDataProvider implements IStaticDataProvider {
    private readonly httpClient: XmlHttpRequestClient;
    constructor() {
        this.httpClient = new XmlHttpRequestClient();
    }
    getStaticData(objectType: string): Promise<any> {
        let path = objectType == "defaultMockData.json" ? "/tests/mocks/defaultMockData.json" : "/editors/templates/default.json";

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