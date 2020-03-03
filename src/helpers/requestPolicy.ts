import { PolicyFragment } from "./policyFragment";
import { JObject } from "./jObject";
import { Utils } from "../utils";

/**
 * Model of "Request" policy
 */
export class RequestPolicy extends PolicyFragment {
    private xml: string;
    private xmlIsParsable: boolean = true;

    constructor(fromScratch: boolean = true) {
        super("root");
    }

    public static fromConfig(config: JObject, policyScope?: string): RequestPolicy {
        const policy = new RequestPolicy(false);

        config.children.forEach(childPolicyConfig => {
            policy.policies.push(PolicyFragment.fromConfig(childPolicyConfig));
        });

        const identifierAttribute = config.attributes.find(x => x.name === "id");

        if (identifierAttribute && identifierAttribute.value) {
            policy.identifier = identifierAttribute.value;
        }

        return policy;
    }

    public static fromXml(policyXml: string, policyScope: string): RequestPolicy {
        try {
            const expressions = RequestPolicy.extractLiquid(policyXml).concat(RequestPolicy.extractRazor(policyXml)).concat(RequestPolicy.extractXsl(policyXml));
            const expressionsTable = {};

            let policyXmlWithoutExpressions = policyXml;
            expressions.forEach(expression => {
                const expressionId = `expr${Utils.getBsonObjectId()}`;
                policyXmlWithoutExpressions = policyXmlWithoutExpressions.replace(expression.trim(), expressionId);
                expressionsTable[expressionId] = expression;
            });

            const checkForExpression = (checkValue: string): string => {
                if (checkValue && checkValue.indexOf("expr") > -1) {
                    Object.keys(expressionsTable).forEach(exprId => {
                        checkValue = checkValue.replace(new RegExp(exprId, "gi"), () => expressionsTable[exprId]);
                    });
                }

                return checkValue;
            };

            const requestPolicyConfig = JObject.fromXml(policyXmlWithoutExpressions, {
                attribute: checkForExpression,
                text: checkForExpression,
                cdata: checkForExpression,
                comment: checkForExpression
            });
            const requestPolicy = <RequestPolicy>RequestPolicy.fromConfig(requestPolicyConfig, policyScope);

            return requestPolicy;
        }
        catch (error) {
            console.warn(`Unable to parse policy XML. Forms editing is not available.`);

            const unparsedRequestPolicy = new RequestPolicy();
            unparsedRequestPolicy.xml = policyXml;
            unparsedRequestPolicy.xmlIsParsable = false;

            return unparsedRequestPolicy;
        }
    }

    public toXml(): string {
        if (!this.xmlIsParsable) {
            return this.xml;
        }

        const config = this.toConfig();

        let policyXml = "";

        config.children.forEach(child => {
            policyXml += child.toXml({
                attribute: v => !Utils.isExpression(v)
            });
        });

        return policyXml.trim();
    }

    private static extractLiquid(xml: string): string[] {
        const entries = [];
        const regex = /<set-body .*?template="liquid.*?"[^\/]*?>([\s\S]*?)<\/set-body>/g;

        let match;

        while ((match = regex.exec(xml)) !== null) {
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            entries.push(match[1]);
        }

        return entries;
    }

    private static extractXsl(xml: string): string[] {
        const entries = [];
        const regex = /<xsl-transform>([\s\S]*?)<\/xsl-transform>/g;

        let match;

        while ((match = regex.exec(xml)) !== null) {
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            entries.push(match[1]);
        }

        return entries;
    }

    private static extractRazor(xml: string): string[] {
        const entries = [];

        let stackDepth = 0;
        let expressionStart = null;
        let expressionEnd = null;
        let expressionOpener = null;
        let expressionCloser = null;

        for (let i = 0; i < xml.length; i++) {
            if (expressionStart) {
                if (xml[i] === expressionOpener) {
                    stackDepth++;
                }

                if (xml[i] === expressionCloser) {
                    if (--stackDepth < 0) {
                        throw new Error("Error parsing Razor expression.");
                    }
                }

                if (stackDepth === 0) {
                    expressionEnd = i;

                    entries.push(xml.substring(expressionStart, expressionEnd + 1));

                    expressionStart = null;
                    expressionEnd = null;
                }
            } else {
                if (xml[i] === "@" && xml[i + 1] === "{") {
                    expressionStart = i;
                    expressionOpener = "{";
                    expressionCloser = "}";
                }

                if (xml[i] === "@" && xml[i + 1] === "(") {
                    expressionStart = i;
                    expressionOpener = "(";
                    expressionCloser = ")";
                }
            }
        }

        if (stackDepth > 0) {
            throw new Error("Error parsing Razor expression.");
        }

        return entries;
    }
}