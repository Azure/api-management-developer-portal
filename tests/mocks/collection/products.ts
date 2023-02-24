import { Product } from "./product";
export class Products {
    public productList: Product[]
    
    public constructor(){
        this.productList = [];
    }

    public addProduct(product: Product){
        this.productList.push(product);
    }
    
    public getProductListResponse(){
        let values: Object[] = [];

        this.productList.forEach(product => {
            values.push(product.getProductBodyResponse());
        });
        
        return {
            "/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/products":{
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
