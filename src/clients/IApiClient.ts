import { HttpHeader } from "@paperbits/common/http";

//TODO: add comment lines
export default interface IApiClient {

    getAll<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse[]>;

    get<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse>;

    post<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse>;

    patch<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse>;

    put<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse>;

    delete<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse>;

    head<T>(url: string, headers?: HttpHeader[]): Promise<T>;

    getPortalHeader(eventName?: string): Promise<HttpHeader>;
}