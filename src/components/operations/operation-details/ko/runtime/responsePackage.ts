export interface NameValuePair {
    name: string;
    value: string;
}

export interface ResponsePackage {
    statusCode: number;
    statusMessage: string;
    headers: NameValuePair[];
    body: any;
}