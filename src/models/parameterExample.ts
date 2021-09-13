/**
 * Request parameter/header example.
 */
export class ParameterExample {
    constructor(
        /**
         * Title, e.g. `Short version`
         */
        public title: string,

        /**
         * Description, e.g. `Short version of the API`.
         */
        public description: string,

        /**
         * Example value, e.g. `api-version`.
         */
        public value: string
    ) { }
}