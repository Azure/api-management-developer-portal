import { HttpHeader } from "@paperbits/common/http";

export interface ResponsePackage {
    statusCode: number;
    statusMessage: string;
    headers: HttpHeader[];
    body: any;
}