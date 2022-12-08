import { Utils } from "./utils";
import { assert } from "chai";

describe("Utils", () => {

    it("getBaseUrlWithDeveloperSuffix - Can return suffixed developer url", () => {

        //arrange
        const url = "https://microsoft.com";

        //act
        const suffixedUrl = Utils.getBaseUrlWithDeveloperSuffix(url);

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
});