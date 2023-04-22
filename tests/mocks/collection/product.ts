export class Product{
    public productId: string;
    public productName: string;
    
    public constructor(productId: string, productName: string){
        this.productId = productId;
        this.productName = productName;
    }
    
    public getProductResponse(){
        let response = {};
        var url = `/developer/products/${this.productId}`;
        response[url] = {
            "headers": [
                {
                  "name": "content-type",
                  "value": "application/json; charset=utf-8"
                }
              ],
              "statusCode": 200,
              "statusText": "OK",
              "body": this.getProductBodyResponse()
        };
        return response;
    }

    public getProductBodyResponse(){
        return {
            "id": `${this.productId}`,
            "type": "Microsoft.ApiManagement/service/products",
            "name": this.productId,
            "properties": {
                "displayName": this.productName,
                "description": "Subscribers will be able to run 5 calls/minute up to a maximum of 100 calls/week.",
                "terms": "",
                "subscriptionRequired": true,
                "approvalRequired": false,
                "subscriptionsLimit": 1,
                "state": "published"
            }
        };
    }

    public static getStartedProduct(){
        return new Product("starter", "Starter");
    }

    public static getUnlimitedProduct(){
        return new Product("unlimited", "Unlimited");
    }
}
