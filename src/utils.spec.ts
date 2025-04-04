import { Utils } from "./utils";
import { assert } from "chai";

describe("Utils", () => {

    it("getBaseUrlWithDeveloperSuffix - Can return suffixed developer url", () => {

        //arrange
        const url = "https://microsoft.com";
        const settings = { backendUrl: "https://microsoft.com" };

        //act
        const suffixedUrl = Utils.getDataApiUrl(settings);

        //assert
        assert.equal(suffixedUrl, `${url}/developer`);
    });

    it("getBaseUrlWithMapiSuffix - Can return suffixed mapi url", () => {

        //arrange
        const url = "https://microsoft.com";

        //act
        const suffixedUrl = Utils.getBaseUrlWithMapiSuffix(url);

        //assert
        assert.equal(suffixedUrl, `${url}/mapi`);
    });

    it("ensureUserPrefixed - Can return user prefixed query", () => {

        //arrange
        const query = "/apis";
        const userId = "123"

        //act
        const prefixedQuery = Utils.ensureUserPrefixed(query, userId);

        //assert
        assert.equal(prefixedQuery, `/users/${userId}${query}`);
    });

    it("ensureUserPrefixed - Can't prefix when userId is null", () => {

        //arrange
        const query = "/apis";
        const userId = null

        //act
        const prefixedQuery = Utils.ensureUserPrefixed(query, userId);

        //assert
        assert.equal(prefixedQuery, query);
    });

    it("ensureUserPrefixed - Can't prefix when userId is integration", () => {

        //arrange
        const query = "/apis";
        const userId = "integration"

        //act
        const prefixedQuery = Utils.ensureUserPrefixed(query, userId);

        //assert
        assert.equal(prefixedQuery, query);
    });

    it("ensureUserPrefixed - Can't prefix when userId is already prefixed", () => {

        //arrange
        const query = "/users/123/apis";
        const userId = "321"

        //act
        const prefixedQuery = Utils.ensureUserPrefixed(query, userId);

        //assert
        assert.equal(prefixedQuery, query);
    });

    describe("IsQueryParameterExists()", function () {
        const tests = [
            {uri: "/somepath", parameterName: "api-version" , expected: false},
            {uri: "https://localhost/somepath", parameterName: "api-version" , expected: false},
            {uri: "/somepath?api-version=asdf", parameterName: "api-version" , expected: true},
            {uri: "somepath?api-version=asdf", parameterName: "api-version" , expected: true},
            {uri: "", parameterName: "api-version" , expected: false},
            {uri: null, parameterName: "api-version" , expected: false},
            {uri: "asdf", parameterName: "api-version" , expected: false},
            {uri: "https://localhost/somepath?api-version=asdf", parameterName: "api-version" , expected: true},
            {uri: "https://localhost/somepath?api-version", parameterName: "api-version" , expected: true},
            {uri: "http://example.com/somepath?api-version", parameterName: "api-version" , expected: true},
            {uri: "http://example.com/somepath?api-version", parameterName: "api-version" , expected: true},

        ];

        tests.forEach(({uri, parameterName, expected}) => {
            it(`correctly verifies existing of parameter ${parameterName} in uri:${uri} `, function () {
            const res = Utils.IsQueryParameterExists(uri, parameterName);
            assert.strictEqual(res, expected);
            });
        });
    });

    it("sanitizeReturnUrl - Return / if returnUrl is not relative path", () => {
        let test = "/path/to/resource"; // true, valid relative URL
        let result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, test);

        test = "/path/to/resource?test=test"; // true, valid relative URL
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, test);

        test = "/path/to/product#product=product1"; // true, valid relative URL
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, test);

        test = "/path/to/api-details#api=echo-api"; // true, valid relative URL
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, test);

        test = "/api-details#api=echo-api&operation=create-resource1"; // true, valid relative URL
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, test);

        test = "/\\test.com"; // false, invalid due to backslash
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, "/");

        test = "test.com"; // false, invalid
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, "/");

        test = "http://test.com"; // false, not a relative URL
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, "/");

        test = "//test.com"; // false, protocol-relative URL, not strictly relative
        result = Utils.sanitizeReturnUrl(test);
        assert.equal(result, "/");
    });
});