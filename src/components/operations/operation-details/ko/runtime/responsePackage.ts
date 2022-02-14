import { NameValuePair } from "../../../../../contracts/nameValuePair";

export interface ResponsePackage {
    statusCode: number;
    statusMessage: string;
    headers: NameValuePair[];
    body: any;
}