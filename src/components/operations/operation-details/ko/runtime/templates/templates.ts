import * as curl from "./curl.liquid";
import * as csharp from "./csharp.liquid";
import * as http from "./http.liquid";
import * as java from "./java.liquid";
import * as javascript from "./javascript.liquid";
import * as php from "./php.liquid";
import * as python from "./python.liquid";
import * as ruby from "./ruby.liquid";
import * as swift from "./swift.liquid"
import * as ws_wscat from "./ws_wscat.liquid";
import * as ws_csharp from "./ws_csharp.liquid";
import * as ws_javascript from "./ws_javascript.liquid";

export const templates = {
    curl: curl.default,
    csharp: csharp.default,
    http: http.default,
    java: java.default,
    javascript: javascript.default,
    php: php.default,
    python: python.default,
    ruby: ruby.default,
    swift: swift.default,
    ws_wscat: ws_wscat.default,
    ws_csharp: ws_csharp.default,
    ws_javascript: ws_javascript.default,

};