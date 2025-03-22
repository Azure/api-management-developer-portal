import { HttpHeader, HttpResponse } from "@paperbits/common/http";

export default interface IApiClient {

    /**
     * Performs a GET request.
     * @param url Url of the resource.
     * @param headers (optional) Url of the resource.
     */
    getAll<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse[]>;

    /**
     * Performs a GET request.
     * @param url Url of the resource.
     * @param httpMethod Http method for request.
     * @param headers (optional) Headers of the request.
     * @param body (optional) Payload of the request.
     */
    send<TResponse>(url: string, httpMethod: string, headers?: HttpHeader[], body?: any): Promise<HttpResponse<TResponse>>;

    /**
     * Performs a GET request.
     * @param url Url of the resource.
     * @param headers (optional) Headers of the request.
     */
    get<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse>;

    /**
     * Performs a POST request.
     * @param url Url of the resource.
     * @param headers (optional) Headers of the request.
     * @param body (optional) Payload of the request.
     */
    post<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse>;

    /**
     * Performs a PATCH request.
     * @param url Url of the resource.
     * @param headers (optional) Headers of the request.
     * @param body (optional) Payload of the request.
     */
    patch<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse>;

    /**
     * Performs a PUT request.
     * @param url Url of the resource.
     * @param headers (optional) Headers of the request.
     * @param body (optional) Payload of the request.
     */
    put<TResponse>(url: string, headers?: HttpHeader[], body?: any): Promise<TResponse>;

    /**
     * Performs a DELETE request.
     * @param url Url of the resource.
     * @param headers (optional) Headers of the request.
     */
    delete<TResponse>(url: string, headers?: HttpHeader[]): Promise<TResponse>;

    /**
     * Performs a HEAD request.
     * @param url Url of the resource.
     * @param headers (optional) Headers of the request.
     */
    head<T>(url: string, headers?: HttpHeader[]): Promise<T>;

    /**
     * Get the default headers.
     * @param eventName The event related to requested header.
     */
    getPortalHeader(eventName?: string): Promise<HttpHeader>;
}