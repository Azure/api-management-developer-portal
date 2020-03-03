let fromCharCode = String.fromCharCode;
let hasOwnProperty = Object.prototype.hasOwnProperty;
let ENTITY_PATTERN = /&#(\d+);|&#x([0-9a-f]+);|&(\w+);/ig;

let ENTITY_MAPPING = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"'
};

// map UPPERCASE variants of supported special chars
Object.keys(ENTITY_MAPPING).forEach(function (k) {
    ENTITY_MAPPING[k.toUpperCase()] = ENTITY_MAPPING[k];
});

function replaceEntities(_, d, x, z) {

    // reserved names, i.e. &nbsp;
    if (z) {
        if (hasOwnProperty.call(ENTITY_MAPPING, z)) {
            return ENTITY_MAPPING[z];
        } else {
            // fall back to original value
            return "&" + z + ";";
        }
    }

    // decimal encoded char
    if (d) {
        return fromCharCode(d);
    }

    // hex encoded char
    return fromCharCode(parseInt(x, 16));
}


/**
 * A basic entity decoder that can decode a minimal
 * sub-set of reserved names (&amp;) as well as
 * hex (&#xaaf;) and decimal (&#1231;) encoded characters.
 *
 * @param {string} str
 *
 * @return {string} decoded string
 */
function decodeEntities(s) {
    if (s.length > 3 && s.indexOf("&") !== -1) {
        return s.replace(ENTITY_PATTERN, replaceEntities);
    }

    return s;
}

let XSI_URI = "http://www.w3.org/2001/XMLSchema-instance";
let XSI_PREFIX = "xsi";
let XSI_TYPE = "xsi:type";

let NON_WHITESPACE_OUTSIDE_ROOT_NODE = "non-whitespace outside of root node";

function error(msg) {
    return new Error(msg);
}

function missingNamespaceForPrefix(prefix) {
    return "missing namespace for prefix <" + prefix + ">";
}

function getter(getFn) {
    return {
        get: getFn,
        enumerable: true
    };
}

function cloneNsMatrix(nsMatrix) {
    let clone = {}, key;
    for (key in nsMatrix) {
        clone[key] = nsMatrix[key];
    }
    return clone;
}

function uriPrefix(prefix) {
    return prefix + "$uri";
}

function buildNsMatrix(nsUriToPrefix) {
    let nsMatrix = {},
        uri,
        prefix;

    for (uri in nsUriToPrefix) {
        prefix = nsUriToPrefix[uri];
        nsMatrix[prefix] = prefix;
        nsMatrix[uriPrefix(prefix)] = uri;
    }

    return nsMatrix;
}

function noopGetContext() {
    return { line: 0, column: 0 };
}

function throwFunc(err) {
    throw err;
}

/**
 * Creates a new parser with the given options.
 *
 * @constructor
 *
 * @param  {!Object<string, ?>=} options
 */
export function Parser(options): void {

    if (!this) {
        return new Parser(options);
    }

    const proxy = options && options["proxy"];

    let onText,
        onOpenTag,
        onCloseTag,
        onCDATA,
        onError = throwFunc,
        onWarning,
        onComment,
        onQuestion,
        onAttention;

    let getContext = noopGetContext;

    /**
     * Do we need to parse the current elements attributes for namespaces?
     *
     * @type {boolean}
     */
    let maybeNS = false;

    /**
     * Do we process namespaces at all?
     *
     * @type {boolean}
     */
    let isNamespace = false;

    /**
     * The caught error returned on parse end
     *
     * @type {Error}
     */
    let returnError = null;

    /**
     * Should we stop parsing?
     *
     * @type {boolean}
     */
    let parseStop = false;

    /**
     * A map of { uri: prefix } used by the parser.
     *
     * This map will ensure we can normalize prefixes during processing;
     * for each uri, only one prefix will be exposed to the handlers.
     *
     * @type {!Object<string, string>}}
     */
    let nsUriToPrefix;

    /**
     * Handle parse error.
     *
     * @param  {string|Error} err
     */
    function handleError(err) {
        if (!(err instanceof Error)) {
            err = error(err);
        }

        returnError = err;

        onError(err);
    }

    /**
     * Handle parse error.
     *
     * @param  {string|Error} err
     */
    function handleWarning(err) {

        if (!onWarning) {
            return;
        }

        if (!(err instanceof Error)) {
            err = error(err);
        }

        onWarning(err, getContext);
    }

    /**
     * Register parse listener.
     *
     * @param  {string}   name
     * @param  {Function} cb
     *
     * @return {Parser}
     */
    this["on"] = function (name, cb) {

        if (typeof cb !== "function") {
            throw error("required args <name, cb>");
        }

        switch (name) {
            case "openTag": onOpenTag = cb; break;
            case "text": onText = cb; break;
            case "closeTag": onCloseTag = cb; break;
            case "error": onError = cb; break;
            case "warn": onWarning = cb; break;
            case "cdata": onCDATA = cb; break;
            case "attention": onAttention = cb; break; // <!XXXXX zzzz="eeee">
            case "question": onQuestion = cb; break; // <? ....  ?>
            case "comment": onComment = cb; break;
            default:
                throw error("unsupported event: " + name);
        }

        return this;
    };

    /**
     * Set the namespace to prefix mapping.
     *
     * @example
     *
     * parser.ns({
     *   'http://foo': 'foo',
     *   'http://bar': 'bar'
     * });
     *
     * @param  {!Object<string, string>} nsMap
     *
     * @return {Parser}
     */
    this["ns"] = function (nsMap) {

        if (typeof nsMap === "undefined") {
            nsMap = {};
        }

        if (typeof nsMap !== "object") {
            throw error("required args <nsMap={}>");
        }

        let _nsUriToPrefix = {}, k;

        for (k in nsMap) {
            _nsUriToPrefix[k] = nsMap[k];
        }

        // FORCE default mapping for schema instance
        _nsUriToPrefix[XSI_URI] = XSI_PREFIX;

        isNamespace = true;
        nsUriToPrefix = _nsUriToPrefix;

        return this;
    };

    /**
     * Parse xml string.
     *
     * @param  {string} xml
     *
     * @return {Error} returnError, if not thrown
     */
    this["parse"] = function (xml) {
        if (typeof xml !== "string") {
            throw error("required args <xml=string>");
        }

        returnError = null;

        parse(xml);

        getContext = noopGetContext;
        parseStop = false;

        return returnError;
    };

    /**
     * Stop parsing.
     */
    this["stop"] = function () {
        parseStop = true;
    };

    /**
     * Parse string, invoking configured listeners on element.
     *
     * @param  {string} xml
     */
    function parse(xml) {
        let nsMatrixStack = isNamespace ? [] : null,
            nsMatrix = isNamespace ? buildNsMatrix(nsUriToPrefix) : null,
            _nsMatrix,
            nodeStack = [],
            anonymousNsCount = 0,
            tagStart = false,
            tagEnd = false,
            i = 0, j = 0,
            x, y, q, w,
            xmlns,
            elementName,
            _elementName,
            elementProxy
            ;

        let attrsString = "",
            attrsStart = 0,
            cachedAttrs // false = parsed with errors, null = needs parsing
            ;

        /**
         * Parse attributes on demand and returns the parsed attributes.
         *
         * Return semantics: (1) `false` on attribute parse error,
         * (2) object hash on extracted attrs.
         *
         * @return {boolean|Object}
         */
        function getAttrs() {
            if (cachedAttrs !== null) {
                return cachedAttrs;
            }

            let nsUri,
                nsUriPrefix,
                nsName,
                defaultAlias = isNamespace && nsMatrix["xmlns"],
                attrList = isNamespace && maybeNS ? [] : null,
                i = attrsStart,
                s = attrsString,
                l = s.length,
                hasNewMatrix,
                newalias,
                value,
                alias,
                name,
                attrs = {},
                seenAttrs = {},
                skipAttr,
                w,
                j;

            parseAttr:
            for (; i < l; i++) {
                skipAttr = false;
                w = s.charCodeAt(i);

                if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE={ \f\n\r\t\v}
                    continue;
                }

                // wait for non whitespace character
                if (w < 65 || w > 122 || (w > 90 && w < 97)) {
                    if (w !== 95 && w !== 58) { // char 95"_" 58":"
                        handleWarning("illegal first char attribute name");
                        skipAttr = true;
                    }
                }

                // parse attribute name
                for (j = i + 1; j < l; j++) {
                    w = s.charCodeAt(j);

                    if (
                        w > 96 && w < 123 ||
                        w > 64 && w < 91 ||
                        w > 47 && w < 59 ||
                        w === 46 || // '.'
                        w === 45 || // '-'
                        w === 95 // '_'
                    ) {
                        continue;
                    }

                    // unexpected whitespace
                    if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
                        handleWarning("missing attribute value");
                        i = j;

                        continue parseAttr;
                    }

                    // expected "="
                    if (w === 61) { // "=" == 61
                        break;
                    }

                    handleWarning("illegal attribute name char");
                    skipAttr = true;
                }

                name = s.substring(i, j);

                if (name === "xmlns:xmlns") {
                    handleWarning("illegal declaration of xmlns");
                    skipAttr = true;
                }

                w = s.charCodeAt(j + 1);

                if (w === 34) { // '"'
                    j = s.indexOf('"', i = j + 2);

                    if (j === -1) {
                        j = s.indexOf("'", i);

                        if (j !== -1) {
                            handleWarning("attribute value quote missmatch");
                            skipAttr = true;
                        }
                    }

                } else if (w === 39) { // "'"
                    j = s.indexOf("'", i = j + 2);

                    if (j === -1) {
                        j = s.indexOf('"', i);

                        if (j !== -1) {
                            handleWarning("attribute value quote missmatch");
                            skipAttr = true;
                        }
                    }

                } else {
                    handleWarning("missing attribute value quotes");
                    skipAttr = true;

                    // skip to next space
                    for (j = j + 1; j < l; j++) {
                        w = s.charCodeAt(j + 1);

                        if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
                            break;
                        }
                    }

                }

                if (j === -1) {
                    handleWarning("missing closing quotes");

                    j = l;
                    skipAttr = true;
                }

                if (!skipAttr) {
                    value = s.substring(i, j);
                }

                i = j;

                // ensure SPACE follows attribute
                // skip illegal content otherwise
                // example a="b"c
                for (; j + 1 < l; j++) {
                    w = s.charCodeAt(j + 1);

                    if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
                        break;
                    }

                    // FIRST ILLEGAL CHAR
                    if (i === j) {
                        handleWarning("illegal character after attribute end");
                        skipAttr = true;
                    }
                }

                // advance cursor to next attribute
                i = j + 1;

                if (skipAttr) {
                    continue parseAttr;
                }

                // check attribute re-declaration
                if (name in seenAttrs) {
                    handleWarning("attribute <" + name + "> already defined");
                    continue;
                }

                seenAttrs[name] = true;

                if (!isNamespace) {
                    attrs[name] = value;
                    continue;
                }

                // try to extract namespace information
                if (maybeNS) {
                    newalias = (
                        name === "xmlns"
                            ? "xmlns"
                            : (name.charCodeAt(0) === 120 && name.substr(0, 6) === "xmlns:")
                                ? name.substr(6)
                                : null
                    );

                    // handle xmlns(:alias) assignment
                    if (newalias !== null) {
                        nsUri = decodeEntities(value);
                        nsUriPrefix = uriPrefix(newalias);

                        alias = nsUriToPrefix[nsUri];

                        if (!alias) {
                            // no prefix defined or prefix collision
                            if (
                                (newalias === "xmlns") ||
                                (nsUriPrefix in nsMatrix && nsMatrix[nsUriPrefix] !== nsUri)
                            ) {
                                // alocate free ns prefix
                                do {
                                    alias = "ns" + (anonymousNsCount++);
                                } while (typeof nsMatrix[alias] !== "undefined");
                            } else {
                                alias = newalias;
                            }

                            nsUriToPrefix[nsUri] = alias;
                        }

                        if (nsMatrix[newalias] !== alias) {
                            if (!hasNewMatrix) {
                                nsMatrix = cloneNsMatrix(nsMatrix);
                                hasNewMatrix = true;
                            }

                            nsMatrix[newalias] = alias;
                            if (newalias === "xmlns") {
                                nsMatrix[uriPrefix(alias)] = nsUri;
                                defaultAlias = alias;
                            }

                            nsMatrix[nsUriPrefix] = nsUri;
                        }

                        // expose xmlns(:asd)="..." in attributes
                        attrs[name] = value;
                        continue;
                    }

                    // collect attributes until all namespace
                    // declarations are processed
                    attrList.push(name, value);
                    continue;

                } /** end if (maybeNs) */

                // handle attributes on element without
                // namespace declarations
                w = name.indexOf(":");
                if (w === -1) {
                    attrs[name] = value;
                    continue;
                }

                // normalize ns attribute name
                if (!(nsName = nsMatrix[name.substring(0, w)])) {
                    handleWarning(missingNamespaceForPrefix(name.substring(0, w)));
                    continue;
                }

                name = defaultAlias === nsName
                    ? name.substr(w + 1)
                    : nsName + name.substr(w);
                // end: normalize ns attribute name

                // normalize xsi:type ns attribute value
                if (name === XSI_TYPE) {
                    w = value.indexOf(":");

                    if (w !== -1) {
                        nsName = value.substring(0, w);
                        // handle default prefixes, i.e. xs:String gracefully
                        nsName = nsMatrix[nsName] || nsName;
                        value = nsName + value.substring(w);
                    } else {
                        value = defaultAlias + ":" + value;
                    }
                }
                // end: normalize xsi:type ns attribute value

                attrs[name] = value;
            }


            // handle deferred, possibly namespaced attributes
            if (maybeNS) {

                // normalize captured attributes
                for (i = 0, l = attrList.length; i < l; i++) {

                    name = attrList[i++];
                    value = attrList[i];

                    w = name.indexOf(":");

                    if (w !== -1) {
                        // normalize ns attribute name
                        if (!(nsName = nsMatrix[name.substring(0, w)])) {
                            handleWarning(missingNamespaceForPrefix(name.substring(0, w)));
                            continue;
                        }

                        name = defaultAlias === nsName
                            ? name.substr(w + 1)
                            : nsName + name.substr(w);
                        // end: normalize ns attribute name

                        // normalize xsi:type ns attribute value
                        if (name === XSI_TYPE) {
                            w = value.indexOf(":");

                            if (w !== -1) {
                                nsName = value.substring(0, w);
                                // handle default prefixes, i.e. xs:String gracefully
                                nsName = nsMatrix[nsName] || nsName;
                                value = nsName + value.substring(w);
                            } else {
                                value = defaultAlias + ":" + value;
                            }
                        }
                        // end: normalize xsi:type ns attribute value
                    }

                    attrs[name] = value;
                }
                // end: normalize captured attributes
            }

            return cachedAttrs = attrs;
        }

        /**
         * Extract the parse context { line, column, part }
         * from the current parser position.
         *
         * @return {Object} parse context
         */
        function getParseContext() {
            const splitsRe = /(\r\n|\r|\n)/g;

            let line = 0;
            let column = 0;
            let startOfLine = 0;
            let endOfLine = j;
            let match;
            let data;

            while (i >= startOfLine) {

                match = splitsRe.exec(xml);

                if (!match) {
                    break;
                }

                // end of line = (break idx + break chars)
                endOfLine = match[0].length + match.index;

                if (endOfLine > i) {
                    break;
                }

                // advance to next line
                line += 1;

                startOfLine = endOfLine;
            }

            // EOF errors
            if (i === -1) {
                column = endOfLine;
                data = xml.substring(j);
            } else
                // start errors
                if (j === 0) {
                    console.log(i - startOfLine);
                    data = xml.substring(j, i);
                }
                // other errors
                else {
                    column = i - startOfLine;
                    data = (j === -1 ? xml.substring(i) : xml.substring(i, j + 1));
                }

            return {
                data: data,
                line: line,
                column: column
            };
        }

        getContext = getParseContext;


        if (proxy) {
            elementProxy = Object.create({}, {
                name: getter(function () {
                    return elementName;
                }),
                originalName: getter(function () {
                    return _elementName;
                }),
                attrs: getter(getAttrs),
                ns: getter(function () {
                    return nsMatrix;
                })
            });
        }

        // actual parse logic
        while (j !== -1) {

            if (xml.charCodeAt(j) === 60) { // "<"
                i = j;
            } else {
                i = xml.indexOf("<", j);
            }

            // parse end
            if (i === -1) {
                if (nodeStack.length) {
                    return handleError("unexpected end of file");
                }

                if (j === 0) {
                    return handleError("missing start tag");
                }

                if (j < xml.length) {
                    if (xml.substring(j).trim()) {
                        handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
                    }
                }

                return;
            }

            // parse text
            if (j !== i) {

                if (nodeStack.length) {
                    if (onText) {
                        onText(xml.substring(j, i), decodeEntities, getContext);

                        if (parseStop) {
                            return;
                        }
                    }
                } else {
                    if (xml.substring(j, i).trim()) {
                        handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);

                        if (parseStop) {
                            return;
                        }
                    }
                }
            }

            w = xml.charCodeAt(i + 1);

            // parse comments + CDATA
            if (w === 33) { // "!"
                w = xml.charCodeAt(i + 2);
                if (w === 91 && xml.substr(i + 3, 6) === "CDATA[") { // 91 == "["
                    j = xml.indexOf("]]>", i);
                    if (j === -1) {
                        return handleError("unclosed cdata");
                    }

                    if (onCDATA) {
                        onCDATA(xml.substring(i + 9, j), getContext);
                        if (parseStop) {
                            return;
                        }
                    }

                    j += 3;
                    continue;
                }


                if (w === 45 && xml.charCodeAt(i + 3) === 45) { // 45 == "-"
                    j = xml.indexOf("-->", i);
                    if (j === -1) {
                        return handleError("unclosed comment");
                    }


                    if (onComment) {
                        onComment(xml.substring(i + 4, j), decodeEntities, getContext);
                        if (parseStop) {
                            return;
                        }
                    }

                    j += 3;
                    continue;
                }

                j = xml.indexOf(">", i + 1);
                if (j === -1) {
                    return handleError("unclosed tag");
                }

                if (onAttention) {
                    onAttention(xml.substring(i, j + 1), decodeEntities, getContext);
                    if (parseStop) {
                        return;
                    }
                }

                j += 1;
                continue;
            }

            if (w === 63) { // "?"
                j = xml.indexOf("?>", i);
                if (j === -1) {
                    return handleError("unclosed question");
                }

                if (onQuestion) {
                    onQuestion(xml.substring(i, j + 2), getContext);
                    if (parseStop) {
                        return;
                    }
                }

                j += 2;
                continue;
            }

            j = xml.indexOf(">", i + 1);

            if (j === -1) {
                return handleError("unclosed tag");
            }

            // don't process attributes;
            // there are none
            cachedAttrs = {};

            // if (xml.charCodeAt(i+1) === 47) { // </...
            if (w === 47) { // </...
                tagStart = false;
                tagEnd = true;

                if (!nodeStack.length) {
                    return handleError("missing open tag");
                }

                // verify open <-> close tag match
                x = elementName = nodeStack.pop();
                q = i + 2 + x.length;

                if (xml.substring(i + 2, q) !== x) {
                    return handleError("closing tag mismatch");
                }

                // verify chars in close tag
                for (; q < j; q++) {
                    w = xml.charCodeAt(q);

                    if (w === 32 || (w > 8 && w < 14)) { // \f\n\r\t\v space
                        continue;
                    }

                    return handleError("close tag");
                }

            } else {
                if (xml.charCodeAt(j - 1) === 47) { // .../>
                    x = elementName = xml.substring(i + 1, j - 1);

                    tagStart = true;
                    tagEnd = true;

                } else {
                    x = elementName = xml.substring(i + 1, j);

                    tagStart = true;
                    tagEnd = false;
                }

                if (!(w > 96 && w < 123 || w > 64 && w < 91 || w === 95 || w === 58)) { // char 95"_" 58":"
                    return handleError("illegal first char nodeName");
                }

                for (q = 1, y = x.length; q < y; q++) {
                    w = x.charCodeAt(q);

                    if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w === 46) {
                        continue;
                    }

                    if (w === 32 || (w < 14 && w > 8)) { // \f\n\r\t\v space
                        elementName = x.substring(0, q);
                        // maybe there are attributes
                        cachedAttrs = null;
                        break;
                    }

                    return handleError("invalid nodeName");
                }

                if (!tagEnd) {
                    nodeStack.push(elementName);
                }
            }

            if (isNamespace) {

                _nsMatrix = nsMatrix;

                if (tagStart) {
                    // remember old namespace
                    // unless we're self-closing
                    if (!tagEnd) {
                        nsMatrixStack.push(_nsMatrix);
                    }

                    if (cachedAttrs === null) {
                        // quick check, whether there may be namespace
                        // declarations on the node; if that is the case
                        // we need to eagerly parse the node attributes
                        if ((maybeNS = x.indexOf("xmlns", q) !== -1)) {
                            attrsStart = q;
                            attrsString = x;

                            getAttrs();

                            maybeNS = false;
                        }
                    }
                }

                _elementName = elementName;

                w = elementName.indexOf(":");
                if (w !== -1) {
                    xmlns = nsMatrix[elementName.substring(0, w)];

                    // prefix given; namespace must exist
                    if (!xmlns) {
                        return handleError("missing namespace on <" + _elementName + ">");
                    }

                    elementName = elementName.substr(w + 1);
                } else {
                    xmlns = nsMatrix["xmlns"];

                    // if no default namespace is defined,
                    // we'll import the element as anonymous.
                    //
                    // it is up to users to correct that to the document defined
                    // targetNamespace, or whatever their undersanding of the
                    // XML spec mandates.
                }

                // adjust namespace prefixs as configured
                if (xmlns) {
                    elementName = xmlns + ":" + elementName;
                }

            }

            if (tagStart) {
                attrsStart = q;
                attrsString = x;

                if (onOpenTag) {
                    if (proxy) {
                        onOpenTag(elementProxy, decodeEntities, tagEnd, getContext);
                    } else {
                        onOpenTag(elementName, getAttrs, decodeEntities, tagEnd, getContext);
                    }

                    if (parseStop) {
                        return;
                    }
                }

            }

            if (tagEnd) {

                if (onCloseTag) {
                    onCloseTag(proxy ? elementProxy : elementName, decodeEntities, tagStart, getContext);

                    if (parseStop) {
                        return;
                    }
                }

                // restore old namespace
                if (isNamespace) {
                    if (!tagStart) {
                        nsMatrix = nsMatrixStack.pop();
                    } else {
                        nsMatrix = _nsMatrix;
                    }
                }
            }

            j += 1;
        }
    } /** end parse */
}