
// import { Utils } from "../utils";
// import { NameValuePair } from "request";


// export interface HttpResponse {
//     statusCode: number;
//     statusText?: string;
//     body?: any;
//     headers: NameValuePair[];
//     totalBytes?: number;
// }


// export class CorsService {
//     private corsProxyUrl: string;

//     constructor(
//         protected readonly hostService: HostService
//     ) {
//     }

//     private async getCorsProxyUrl(): Promise<string> {
//         if (this.corsProxyUrl) {
//             return this.corsProxyUrl;
//         }
//         const armEndpoint = await this.hostService.getServiceEndpoint();

//         if (armEndpoint.startsWith("https://api-dogfood.resources.windows-int.net")) {
//             this.corsProxyUrl = "https://apimanagement-cors-proxy-df.azure-api.net/send";
//         }

//         if (armEndpoint.startsWith("https://management.azure.com")) {
//             this.corsProxyUrl = "https://apimanagement-cors-proxy-prd.azure-api.net/send";
//         }

//         if (armEndpoint.startsWith("https://management.usgovcloudapi.net")) {
//             this.corsProxyUrl = "https://apimanagement-cors-proxy-ff.azure-api.us/send";
//         }

//         if (armEndpoint.startsWith("https://management.chinacloudapi.cn")) {
//             this.corsProxyUrl = "https://apimanagement-cors-proxy-mc.azure-api.cn/send";
//         }

//         return this.corsProxyUrl;
//     }

//     public async makeRequest(url: string, method: string, headers: NameValuePair[] = [], body?: any): Promise<HttpResponse> {
//         if (this.isCorsRequired(url, method, headers, body)) {
//             const authorizationToken = await this.hostService.getServiceAuth();
//             const serviceId = await this.hostService.getServiceEndpoint();

//             headers = headers.map(h => <NameValuePair>{ name: `Ocp-Apim-Header-${h.name}`, value: h.value });

//             headers.push({ name: "Cache-Control", value: "no-cache, no-store" });
//             headers.push({ name: "Authorization", value: authorizationToken });
//             headers.push({ name: "Ocp-Apim-Service-Name", value: Utils.extractIdentifier(serviceId, "service") });
//             headers.push({ name: "Ocp-Apim-Resource-Group", value: Utils.extractIdentifier(serviceId, "resourceGroups") });
//             headers.push({ name: "Ocp-Apim-Subscription", value: Utils.extractIdentifier(serviceId, "subscriptions") });
//             headers.push({ name: "Ocp-Apim-Url", value: url.trim() });
//             headers.push({ name: "Ocp-Apim-Method", value: method });

//             url = await this.getCorsProxyUrl();

//             method = "POST";
//         }

//         const responsePromise = new Promise<any>((resolve, reject) => {
//             const xhr = new XMLHttpRequest();

//             const onRequestTimeout = () => {
//                 reject({
//                     message: `Request timed out. Please try again later.`,
//                     code: "RequestError",
//                     details: []
//                 });
//             };

//             const onStateChange = () => {
//                 if (xhr.readyState !== 4) {
//                     return;
//                 }

//                 if (xhr.status === 0) {
//                     reject({
//                         message: `Could not complete the request. Please try again later.`,
//                         code: "RequestError",
//                         details: []
//                     });
//                     return;
//                 }

//                 const responseHeadersString = xhr.getAllResponseHeaders();
//                 const responseStatusCode = xhr.status;
//                 const responseHeaders = Utils.parseHeaderString(responseHeadersString);
//                 const httpResponse: HttpResponse = {
//                     statusCode: responseStatusCode,
//                     headers: responseHeaders,
//                     body: xhr.responseText
//                 };

//                 resolve(httpResponse);
//             };

//             xhr.onreadystatechange = onStateChange.bind(this);
//             xhr.ontimeout = onRequestTimeout.bind(this);
//             xhr.open(method, url, true);
//             xhr.timeout = 60000;

//             headers.forEach(header => {
//                 xhr.setRequestHeader(header.name, header.value);
//             });

//             xhr.send(body);
//         });

//         return responsePromise;
//     }

//     private isCorsRequired(url: string, method: string, headers?: NameValuePair[], body?: any): boolean {
//         return !url.startsWith("https://proxy.apim.net");
//     }
// }