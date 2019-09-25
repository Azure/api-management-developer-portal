
import { HttpClient, HttpRequest, HttpResponse, HttpMethod } from "@paperbits/common/http";
import { CaptchaParams } from "../contracts/captchaParams";
import { SignupRequest } from "../contracts/signupRequest";
import { ResetRequest, ResetPassword } from "../contracts/resetRequest";

export class CaptchaService {
    constructor(
        private readonly httpClient: HttpClient
    ) { }

    public async getCaptchaParams(): Promise<CaptchaParams> {
        let response: HttpResponse<CaptchaParams>;
        const httpRequest: HttpRequest = {
            method: HttpMethod.get,
            url: "/captcha"
            // url: `https://igo-test.developer.current.int-azure-api.net/captcha`
        }

        try {
            response = await this.httpClient.send<any>(httpRequest);
        }
        catch (error) {
            throw new Error(`Unable to complete request. Error: ${error}`);
        }

        return this.handleResponse(response);
    }

    public async sendSignupRequest(signupRequest: SignupRequest): Promise<void> {
        const response = await this.httpClient.send(
            { 
                url: "/sign-up", 
                method: HttpMethod.post,
                headers: [{ name: "Content-Type", value: "application/json" }], 
                body: JSON.stringify(signupRequest)
            });
        if (response.statusCode !== 200) {
            if(response.statusCode === 400) {
                const responseObj = <any>response.toObject();
                throw responseObj.error;
            } else {
                throw Error(response.toText());             
            }
        }
    }

    public async sendResetRequest(resetRequest: ResetRequest): Promise<void> {
        const response = await this.httpClient.send(
            { 
                url: "/reset-password-request", 
                method: HttpMethod.post,
                headers: [{ name: "Content-Type", value: "application/json" }], 
                body: JSON.stringify(resetRequest)
            });
        if (response.statusCode !== 200) {
            if(response.statusCode === 400) {
                const responseObj = <any>response.toObject();
                throw responseObj.error;
            } else {
                throw Error(response.toText());             
            }
        }
    }

    public async sendConfirmRequest(resetPassword: ResetPassword): Promise<void> {
        const response = await this.httpClient.send(
            { 
                url: "/confirm/password", 
                method: HttpMethod.post,
                headers: [{ name: "Content-Type", value: "application/json" }], 
                body: JSON.stringify(resetPassword)
            });
        if (response.statusCode !== 200) {
            throw Error(response.toText());
        }
    }

    private handleResponse(response: HttpResponse<CaptchaParams>): CaptchaParams {
        if (response.statusCode === 200) {
            return response.toObject();
        } else {
            console.log("Error: please check captcha endpoint on server");
            throw new Error("Get captcha params error");
        }
    }
}

