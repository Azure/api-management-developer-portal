import { Api } from "./api";
export class Apis {
    public apiList: Api[]
    
    public constructor(){
        this.apiList = [];
    }

    public addApi(api: Api){
        this.apiList.push(api);
    }
    
    public getApisListResponse(){
        let values: Object[] = [];

        this.apiList.forEach(api => {
            values.push(api.getApiBodyResponse());
        });
        
        return {
            "/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/apis":{
                "headers": [
                    {
                        "name": "content-type",
                        "value": "application/json; charset=utf-8"
                    }
                ],
                "statusCode": 200,
                "statusText": "OK",
                "body": {
                    value: values,
                    count: values.length
                }
            }
        };
    }
}
