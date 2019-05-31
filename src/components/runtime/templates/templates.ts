import * as curl from "./curl.liquid";
import * as csharp from "./csharp.liquid";
import * as http from "./http.liquid";
import * as java from "./java.liquid";
import * as javascript from "./javascript.liquid";
import * as php from "./php.liquid";
import * as objc from "./objc.liquid";
import * as python from "./python.liquid";
import * as ruby from "./ruby.liquid";

export const templates = {
    curl: curl.default,
    csharp: csharp.default,
    http: http.default,
    java: java.default,
    javascript: javascript.default,
    php: php.default,
    objc: objc.default,
    python: python.default,
    ruby: ruby.default
};