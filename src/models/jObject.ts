import { Parser } from "saxen";

type JElementType = "element" | "comment" | "cdata" | "text" | "document" | "template" | "question";

export class JAttribute {
    public ns: string;
    public name: string;
    public value: string;

    constructor(name: string, value?: string, ns?: string) {
        this.name = name;
        this.value = value;
        this.ns = ns;
    }
}

export class JObject {
    public ns: string;
    public children: JObject[];
    public attributes: JAttribute[];
    public name: string;
    public value: string;
    public type: JElementType;

    constructor(name?: string, ns?: string) {
        this.type = "element";
        this.name = name;
        this.children = [];
        this.attributes = [];
        this.ns = ns;
    }

    public toString(): string {
        return this.name;
    }

    public join(values: string[], separator: string): string {
        return values.filter(x => x && x !== "").join(separator);
    }

    public static fromXml(xml: string, parseCallbacks?: {
        attribute?: (value: string) => string,
        text?: (value: string) => string,
        cdata?: (value: string) => string,
        comment?: (value: string) => string,
    }): JObject {

        const root = new JObject("document");
        root.type = "document";
        const elementStack = [root];
        const parser = new Parser({ proxy: true });

        const pushChild = (element: JObject) => {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.children.push(element);

            elementStack.push(element);
        };

        const popChild = () => {
            elementStack.pop();
        };

        const pushSibling = (element: JObject) => {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.children.push(element);
        };

        parser.on("question", (str, decodeEntities, contextGetter) => {
            const element = new JObject("", "");
            element.type = "question";
            element.value = str;

            pushSibling(element);
        });

        parser.on("openTag", (el, decodeEntities, selfClosing, getContext) => {
            const elementNameParts = el.name.split(":");

            let elementNamespace: string;
            let elementName: string;

            if (elementNameParts.length > 1) {
                elementNamespace = elementNameParts[0];
                elementName = elementNameParts[1];
            } else {
                elementName = el.name;
            }

            const element = new JObject(elementName, elementNamespace);

            Object.keys(el.attrs).forEach(key => {
                const attributeNameParts = key.split(":");

                let attributeNamespace: string;
                let attributeName: string;

                if (attributeNameParts.length > 1) {
                    attributeNamespace = attributeNameParts[0];
                    attributeName = attributeNameParts[1];
                } else {
                    attributeName = key;
                }

                const tempValue = XmlUtil.decode(el.attrs[key]);
                const attributeValue = parseCallbacks && parseCallbacks.attribute ? parseCallbacks.attribute(tempValue) : tempValue;
                element.attributes.push(new JAttribute(attributeName, attributeValue, attributeNamespace));
            });

            if (el.attrs["template"] && el.attrs["template"].toUpperCase() === "LIQUID" || el.name === "xsl-transform") {
                element.type = "template";
            }

            pushChild(element);
        });

        parser.on("closeTag", (el, decodeEntities, selfClosing, getContext) => {
            popChild();
        });

        parser.on("error", (err, contextGetter) => {
            throw new Error("Unable to parse XML.");
        });

        parser.on("text", (text: string, decodeEntities, contextGetter) => {
            text = text.trim();

            if (!text) {
                return;
            }

            const currentElement = elementStack[elementStack.length - 1];

            if (!currentElement.value) {
                currentElement.value = "";
            }

            currentElement.value += parseCallbacks && parseCallbacks.text ? parseCallbacks.text(text) : text;
        });

        parser.on("cdata", (value: string) => {
            const element = new JObject("", "");
            element.value = parseCallbacks && parseCallbacks.cdata ? parseCallbacks.cdata(value) : value;
            element.type = "cdata";

            pushSibling(element);
        });

        parser.on("comment", (value: string,) => {
            pushSibling(new JComment(parseCallbacks && parseCallbacks.comment ? parseCallbacks.comment(value) : value));
        });

        parser.parse(xml);

        return root;
    }

    private toFormattedXml(identation: number = 0, escapeCallbacks?: {
        attribute?: (value: string) => boolean
    }): string {
        let result = "";
        const content = this.value;
        let lineBreak = "\n";

        for (let i = 0; i < identation; i++) {
            lineBreak += " ";
        }

        switch (this.type) {
            case "document":
                this.children.forEach(child => {
                    result += child.toFormattedXml(0, escapeCallbacks) + "\n";
                });
                break;

            case "element":
            case "template":
                const tag = this.join([this.ns, this.name], ":");

                result += `${lineBreak}<${tag}`;

                this.attributes.forEach(attribute => {
                    let value = attribute.value.toString();
                    value = escapeCallbacks && escapeCallbacks.attribute && !escapeCallbacks.attribute(value) ? value : XmlUtil.encode(value);
                    result += ` ${this.join([attribute.ns, attribute.name], ":")}="${value}"`;
                });

                if (this.children.length > 0) {
                    result += `>`;

                    this.children.forEach(child => {
                        result += child.toFormattedXml(identation + 4, escapeCallbacks);
                    });

                    result += `${lineBreak}</${tag}>`;
                } else if (content) {
                    result += `>${content}</${tag}>`;
                } else {
                    result += ` />`;
                }
                break;

            case "question":
                result += this.value;
                break;

            case "comment":
                result += `${lineBreak}<!--${content}-->`;
                break;

            case "cdata":
                result += `<![CDATA[${content}]]>`;
                break;

            case "text":
                if (content) {
                    result += content;
                }
                break;

            default:
                throw new Error(`Unknown element type ${this.type}.`);
        }

        return result;
    }

    public toXml(escapeCallbacks?: { attribute?: (value: string) => boolean }): string {
        return this.toFormattedXml(0, escapeCallbacks);
    }

    public innerXml(): string {
        return this.children.map(x => x.toFormattedXml()).join();
    }

    public getAttribute(attributeName: string): string {
        const attribute = this.attributes.find(x => x.name === attributeName);

        if (attribute && attribute.value) {
            return attribute.value;
        }

        return undefined;
    }

    public getAttributeAsNumber(attributeName: string): number {
        const value = this.getAttribute(attributeName);
        const result = +value;
        return isNaN(+value) ? undefined : result;
    }

    public setAttribute(attributeName: string, attributeValue: string): void {
        if (attributeValue) {
            this.attributes.push(new JAttribute(attributeName, attributeValue));
        }
    }
}

export class JComment extends JObject {
    constructor(comment: string) {
        super("", "");

        this.value = comment;
        this.type = "comment";
    }
}

export class JText extends JObject {
    constructor(text: string) {
        super("", "");

        this.value = text;
        this.type = "text";
    }
}

class XmlUtil {
    private static readonly chars: string[][] = [
        ["\"", "&quot;"],
        ["&", "&amp;"],
        ["'", "&apos;"],
        ["<", "&lt;"],
        [">", "&gt;"],
        ["\t", "&#x9;"],
        ["\n", "&#xA;"],
        ["\r", "&#xD;"],
    ];

    private static encodeRegex(): RegExp {
        return new RegExp(XmlUtil.chars.map((e) => e[0]).join("|"), "g");
    }

    private static decodeRegex(): RegExp {
        return new RegExp(XmlUtil.chars.map((e) => e[1]).join("|"), "g");
    }

    private static encodeMap = XmlUtil.chars.reduce((i, v) => {
        i[v[0]] = v[1];
        return i;
    }, {});

    private static decodeMap = XmlUtil.chars.reduce((i, v) => {
        i[v[1]] = v[0];
        return i;
    }, {});

    public static encode(str: string): string {
        return str.replace(XmlUtil.encodeRegex(), (s) => XmlUtil.encodeMap[s]);
    }

    public static decode(str: string): string {
        return str.replace(XmlUtil.decodeRegex(), (s) => XmlUtil.decodeMap[s]);
    }
}