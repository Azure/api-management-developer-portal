import { HttpHeader } from "@paperbits/common/http";

/**
 * HTTP response contract.
 */
export interface HttpResponse {
    headers: HttpHeader[];
    statusCode: number;
    statusText: string;
    body: Buffer;
}