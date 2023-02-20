import {Utils} from "../../utils";
export class UserMockData{
    public email;
    public publicId;

    public constructor(){
        this.email = "example@example.example";
        this.publicId = "example-example-example";
    }
    
    public async getSignInResponse(){
        return {
            "/developer/identity":{
                "headers": [
                {
                    "name": "content-type",
                    "value": "application/json; charset=utf-9"
                },
                {
                    "name": "ocp-apim-sas-token",
                    "value": await Utils.getSharedAccessToken(this.publicId, "accesskey", 1)
                }
                ],
                "statusCode": 200,
                "statusText": "OK",
                "body": {
                    "id": this.publicId
                }
            }
        };
    }

    public getUserInfoResponse(){
        let response = {};
        
        var url = `/developer/users/${this.publicId}`;
        response[url] = {
            "headers": [
                {
                    "name": "content-type",
                    "value": "application/json; charset=utf-8"
                }
            ],
            "statusCode": 200,
            "statusText": "OK",
            "body": {
                "id": `${this.publicId}`,
                "type": "Microsoft.ApiManagement/service/users",
                "name": this.publicId,
                "firstName": "name",
                "lastName": "surname",
                "email": this.email,
                "state": "active",
                "registrationDate": "2021-11-08T15:45:18.01Z",
                "note": null,
                "groups": [],
                "identities": [
                    {
                        "provider": "Basic",
                        "id": this.publicId
                    }
                ]
            }
        };

        return response;
    }

    public getUserRegisterResponse(email: string, firstName: string, lastName: string){
        return {
            "/developer/users":{   
                "headers": [
                    {
                        "name": "content-type",
                        "value": "application/json; charset=utf-8"
                    },
                    {
                        "name": "location",
                        "value": `/users/${email}?api-version=2021-04-01-preview`
                    }
                ],
                "statusCode": 201,
                "statusText": "Created",
                "body": {
                    "id": `/users/${email}`,
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "state": "pending",
                    "registrationDate": "2022-02-04T13:42:26.36Z",
                    "note": null,
                    "groups": [
                        {
                            "id": "/groups/developers",
                            "name": "Developers",
                            "builtIn": true,
                            "type": "system",
                            "externalId": null
                        }
                    ],
                    "identities": []
                }
            }
        }
    }
}
