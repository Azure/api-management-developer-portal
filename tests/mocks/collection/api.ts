export class Api{
    public apiId: string;
    public apiName: string;
    
    public constructor(apiId: string, apiName: string){
        this.apiId = apiId;
        this.apiName = apiName;
    }
    
    public getApiResponse(){
        let response = {};
        var url = `/developer/apis/${this.apiId}`;
        response[url] = {
            "headers": [
                {
                  "name": "content-type",
                  "value": "application/json; charset=utf-8"
                }
              ],
              "statusCode": 200,
              "statusText": "OK",
              "body": this.getApiBodyResponse()
        };
        return response;
    }

    public getApiBodyResponse(){
        return {
            "id": `${this.apiId}`,
            "type": "Microsoft.ApiManagement/service/apis",
            "name": this.apiId,
            "properties": {
                "displayName": this.apiName,
                "apiRevision": "1",
                "description": null,
                "subscriptionRequired": true,
                "serviceUrl": "http://echoapi.cloudapp.net/api",
                "path": "echo",
                "protocols": [
                    "https"
                ],
                "authenticationSettings": null,
                "subscriptionKeyParameterNames": null,
                "isCurrent": true
            }
        };
    }

    public static getEchoApi(){
        return new Api("echo-api", "Echo api");
    }
}
