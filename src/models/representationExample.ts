import { Utils } from "../utils";

export class RepresentationExample {
    constructor(
        public title: string,
        public description: string,
        public value: string,
        public contentType: string
    ) {
        if (this.contentType.includes("/xml")) {
            this.value = Utils.formatXml(value);

            if (!title) {
                title = "XML";
            }
        }

        if (this.contentType.includes("/json")) {
            this.value = Utils.formatJson(value);

            if (!title) {
                title = "JSON";
            }
        }
    }
}