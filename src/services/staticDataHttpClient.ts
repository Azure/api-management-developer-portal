import { HttpClient, HttpRequest, HttpResponse, XmlHttpRequestClient } from "@paperbits/common/http";
import IStaticDataProvider from "./IStaticDataProvider";


export class StaticDataHttpClient implements HttpClient {
    private readonly httpClient: XmlHttpRequestClient;
    private readonly mockData: string = "defaultStaticData.json";
    private readonly defaultData: string = "default.json";

    private initPromise: Promise<void>;
    private mockDataObject: Object;
    private defaultDataObject: Object;

    constructor(private readonly dataProvider: IStaticDataProvider) {
        this.httpClient = new XmlHttpRequestClient();
    }

    private async initialize(): Promise<void> {

        if (this.initPromise) {
            return this.initPromise;
        }

        this.mockDataObject = await this.dataProvider.getStaticData(this.mockData);
        this.defaultDataObject = await this.dataProvider.getStaticData(this.defaultData);
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initPromise) {
            this.initPromise = this.initialize();
        }
        return this.initPromise;
    }

    public async send<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        if (request.method === undefined) {
            request.method = "GET";
        }

        const response = new HttpResponse<T>();
        await this.ensureInitialized();
        let result: any;


        const urlWithoutParameters = request.url.split("?")[0];

        if (request.url.match("contentTypes\/.*\/contentItems\/")) {
            response.statusCode = 200;
            response.statusText = "OK";
            response.headers = [{ name: "content-type", value: "application/json; charset=utf-8" }];
            
            const body = this.defaultDataObject[this.getShortUrl(request.url)];
            if (body && "type" in body){
                body["id"] = this.getShortUrl(request.url);
            }
            response.body = Buffer.from(JSON.stringify(body));

            return response;
        }

        // Create new subscription
        const regexp = new RegExp(`https:\/\/contoso\.management\.azure-api\.net\/subscriptions\/sid\/resourceGroups\/rgid\/providers\/Microsoft\.ApiManagement\/service\/sid\/users\/6189460d4634612164e10999\/subscriptions\/[a-xA-Z0-9]*$`);
        const matches = regexp.exec(urlWithoutParameters);
        
        if (matches && matches.length == 1) {
            result = this.mockDataObject["https://contoso.management.azure-api.net/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/users/6189460d4634612164e10999/subscriptions/61fd37461359a02500aad62f"];
        }
        else {

            result = (this.mockDataObject[urlWithoutParameters]);
        }

        if (result == undefined) {
            throw new Error(`No mock data for: ${urlWithoutParameters}`);
        }

        response.headers = result.headers;

        // Image static data is not stored as a JSON object
        if (result.headers && result.headers.find(h => h.name == "content-type" && h.value.indexOf("image") >= 0)) {
            return this.httpClient.send(request);
        }

        response.statusCode = result.statusCode;
        response.statusText = result.statusText;
        response.body = Buffer.from(JSON.stringify(result.body));

        return response;
    }

    private getShortUrl(url: string): string {
        const shortUrl = url.replace("https://contoso.management.azure-api.net/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid", "");
        return shortUrl.split("?")[0];
    }

}