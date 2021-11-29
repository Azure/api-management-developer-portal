import { Utils } from "../utils";

export class RepresentationExample {
    /**
     * Example format, e.g. `json`, `xml`, `plain`. Used for syntax highlight language selection.
     */
    public readonly format: string;

    constructor(
        /**
         * Example title.
         */
        public readonly title: string,

        /**
         * Example description.
         */
        public readonly description: string,

        /**
         * Example value.
         */
        public readonly value: string,

        /**
         * Example content type.
         */
        public readonly contentType: string
    ) {
        if (this.contentType.includes("/xml")) {
            this.value = Utils.formatXml(value);
            this.format = "xml";

            if (!title) {
                title = "XML";
            }
        }

        if (this.contentType.includes("/json")) {
            this.value = Utils.formatJson(value);
            this.format = "json";

            if (!title) {
                title = "JSON";
            }
        }
    }
}