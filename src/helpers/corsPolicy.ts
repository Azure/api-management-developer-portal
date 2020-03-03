import { PolicyFragment } from "./policyFragment";
import { JObject } from "./jObject";


/**
 * Model of "cors" policy
 */
export class CorsPolicy extends PolicyFragment {
    public allowCredentials: boolean;
    public terminateUnmatchedRequest: boolean;
    public preflightResultMaxAge: string;
    public allowedOrigins: string[];
    public allowedMethods: string[];
    public allowedHeaders: string[];
    public exposedHeaders: string[];

    /**
     * @param allowCredentials {boolean}
     *
     * <cors allow-credentials="true" terminate-unmatched-request="false">
     *     <allowed-origins>
     *         <origin>http://example.com/</origin>
     *     </allowed-origins>
     *     <allowed-methods preflight-result-max-age="300">
     *         <method>GET</method>
     *     </allowed-methods>
     *     <allowed-headers>
     *         <header>x-zumo-installation-id</header>
     *     </allowed-headers>
     *     <expose-headers>
     *         <header>x-zumo-application</header>
     *     </expose-headers>
     * </cors>
     */
    constructor() {
        super("cors");

        this.allowedOrigins = ["*"];
        this.allowedMethods = ["GET", "POST"];
        this.allowedHeaders = [];
        this.exposedHeaders = [];
    }

    public static fromConfig(config: JObject): CorsPolicy {
        const policy = new CorsPolicy();

        const allowCredentials = config.getAttribute("allow-credentials");

        if (allowCredentials === "true") {
            policy.allowCredentials = true;
        }

        const terminateUnmatchedRequest = config.getAttribute("terminate-unmatched-request");

        if (terminateUnmatchedRequest === "true") {
            policy.terminateUnmatchedRequest = true;
        }

        const origins = config.children
            .filter(childNode => childNode.name === "allowed-origins")
            .map(origingNode => origingNode.children.filter(y => y.name === "origin"))
            .reduce((x, y) => x.concat(y))
            .map(x => x.value);

        policy.allowedOrigins = origins;

        const allowedMethodsNode = config.children
            .find(childNode => childNode.name === "allowed-methods");

        if (allowedMethodsNode) {
            const preflightResultMaxAge = allowedMethodsNode.getAttribute("preflight-result-max-age");
            policy.preflightResultMaxAge = preflightResultMaxAge;

            const methods = config.children
                .filter(childNode => childNode.name === "allowed-methods")
                .map(origingNode => origingNode.children.filter(y => y.name === "method"))
                .reduce((x, y) => x.concat(y))
                .map(x => x.value);

            policy.allowedMethods = methods;
        }

        const allowedHeadersNode = config.children
            .find(childNode => childNode.name === "allowed-headers");

        if (allowedHeadersNode) {
            const headers = config.children
                .filter(childNode => childNode.name === "allowed-headers")
                .map(origingNode => origingNode.children.filter(y => y.name === "header"))
                .reduce((x, y) => x.concat(y))
                .map(x => x.value);

            policy.allowedHeaders = headers;
        }

        const exposedHeadersNode = config.children
            .find(childNode => childNode.name === "expose-headers");

        if (exposedHeadersNode) {
            const exposeHeaders = config.children
                .filter(childNode => childNode.name === "expose-headers")
                .map(origingNode => origingNode.children.filter(y => y.name === "header"))
                .reduce((x, y) => x.concat(y))
                .map(x => x.value);

            policy.exposedHeaders = exposeHeaders;
        }

        return policy;
    }

    public toConfig(): JObject {
        const config = new JObject("cors");

        if (this.allowCredentials) {
            config.setAttribute("allow-credentials", "true");
        }

        if (this.terminateUnmatchedRequest) {
            config.setAttribute("terminate-unmatched-request", "true");
        }

        if (this.allowedOrigins.length > 0) {
            const allowedOriginsConfig = new JObject("allowed-origins");
            config.children.push(allowedOriginsConfig);

            this.allowedOrigins.forEach(origin => {
                const originConfig = new JObject("origin");
                originConfig.value = origin;
                allowedOriginsConfig.children.push(originConfig);
            });
        }

        if (this.allowedMethods.length > 0) {
            const allowedMethodsConfig = new JObject("allowed-methods");
            config.children.push(allowedMethodsConfig);

            if (this.preflightResultMaxAge) {
                allowedMethodsConfig.setAttribute("preflight-result-max-age", this.preflightResultMaxAge);
            }

            this.allowedMethods.forEach(origin => {
                const methodConfig = new JObject("method");
                methodConfig.value = origin;
                allowedMethodsConfig.children.push(methodConfig);
            });
        }

        if (this.allowedHeaders.length > 0) {
            const allowedHeadersConfig = new JObject("allowed-headers");
            config.children.push(allowedHeadersConfig);

            this.allowedHeaders.forEach(origin => {
                const headerConfig = new JObject("header");
                headerConfig.value = origin;
                allowedHeadersConfig.children.push(headerConfig);
            });
        }

        if (this.exposedHeaders.length > 0) {
            const exposeHeadersConfig = new JObject("expose-headers");
            config.children.push(exposeHeadersConfig);

            this.exposedHeaders.forEach(origin => {
                const headerConfig = new JObject("header");
                headerConfig.value = origin;
                exposeHeadersConfig.children.push(headerConfig);
            });
        }

        return config;
    }
}
