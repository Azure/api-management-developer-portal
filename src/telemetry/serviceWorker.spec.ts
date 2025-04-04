import { assert } from "chai";
import { describe, it } from "mocha";
import { sanitizeUrl, cleanUpUrlParams, cleanUrlSensitiveDataFromQuery, cleanUrlSensitiveDataFromValue } from "./serviceWorker";

describe("serviceWorker", () => {

    describe("sanitizeUrl", () => {
        it("should remove sensitive data from query parameters", () => {
            const url = "https://example.com/path?client_secret=abc&token=xyz&other=123";
            const sanitizedUrl = sanitizeUrl(url);
            assert.equal(sanitizedUrl, "https://example.com/path?client_secret=***&token=***&other=123");
        });

        it("should remove sensitive data from hash parameters", () => {
            const url = "https://example.com/path#client_secret=abc&token=xyz&other=123";
            const sanitizedUrl = sanitizeUrl(url);
            assert.equal(sanitizedUrl, "https://example.com/path#client_secret=***&token=***&other=***");
        });

        it("should handle URLs without sensitive data", () => {
            const url = "https://example.com/path?other=123";
            const sanitizedUrl = sanitizeUrl(url);
            assert.equal(sanitizedUrl, "https://example.com/path?other=123");
        });

        it("should handle URLs with only allowed parameters in hash", () => {
            const url = "https://example.com/path#state=abc&session_state=xyz&client_secret=abc";
            const sanitizedUrl = sanitizeUrl(url);
            assert.equal(sanitizedUrl, "https://example.com/path#state=abc&session_state=xyz&client_secret=***");
        });

        it("should handle null or undefined URLs", () => {
            assert.equal(sanitizeUrl(null), null);
            assert.equal(sanitizeUrl(undefined), undefined);
        });

        it("should handle empty URLs", () => {
            assert.equal(sanitizeUrl(""), "");
        });
    });


    describe("cleanUpUrlParams", () => {
        it("should replace sensitive parameters with ***", () => {
            const url = "https://example.com/path#client_secret=abc&token=xyz&other=123";
            const cleanedUrl = cleanUpUrlParams(url);
            assert.equal(cleanedUrl, "https://example.com/path#client_secret=***&token=***&other=***");
        });

        it("should leave allowed parameters unchanged", () => {
            const url = "https://example.com/path#state=abc&session_state=xyz&client_secret=abc";
            const cleanedUrl = cleanUpUrlParams(url);
            assert.equal(cleanedUrl, "https://example.com/path#state=abc&session_state=xyz&client_secret=***");
        });

        it("should handle URLs without hash", () => {
            const url = "https://example.com/path";
            const cleanedUrl = cleanUpUrlParams(url);
            assert.equal(cleanedUrl, "https://example.com/path");
        });

        it("should handle null or undefined URLs", () => {
            assert.equal(cleanUpUrlParams(null), null);
            assert.equal(cleanUpUrlParams(undefined), undefined);
        });

        it("should handle empty URLs", () => {
            assert.equal(cleanUpUrlParams(""), "");
        });
    });

    describe("cleanUrlSensitiveDataFromQuery", () => {
        it("should replace sensitive query parameters with ***", () => {
            const url = "https://example.com/path?client_secret=abc&token=xyz&other=123";
            const cleanedUrl = cleanUrlSensitiveDataFromQuery(url);
            assert.equal(cleanedUrl, "https://example.com/path?client_secret=***&token=***&other=123");
        });

        it("should handle URLs without query parameters", () => {
            const url = "https://example.com/path";
            const cleanedUrl = cleanUrlSensitiveDataFromQuery(url);
            assert.equal(cleanedUrl, "https://example.com/path");
        });

        it("should handle null or undefined URLs", () => {
            assert.equal(cleanUrlSensitiveDataFromQuery(null), null);
            assert.equal(cleanUrlSensitiveDataFromQuery(undefined), undefined);
        });

        it("should handle empty URLs", () => {
            assert.equal(cleanUrlSensitiveDataFromQuery(""), "");
        });

        it("should handle complex URLs with multiple parameters", () => {
            const url = "https://example.com/api/v1?client_secret=abc123&api_key=xyz789&user=john&password=pass123&normal=value";
            const cleanedUrl = cleanUrlSensitiveDataFromQuery(url);
            assert.equal(cleanedUrl, "https://example.com/api/v1?client_secret=***&api_key=xyz789&user=***&password=***&normal=value");
        });

        it("should handle URLs with encoded characters", () => {
            const url = "https://example.com/path?token=abc%26xyz&user_name=john%20doe";
            const cleanedUrl = cleanUrlSensitiveDataFromQuery(url);
            assert.equal(cleanedUrl, "https://example.com/path?token=***&user_name=***");
        });

        it("should handle special cases like access_token and user_name", () => {
            const url = "https://example.com/oauth?access_token=abc123&user_name=john";
            const cleanedUrl = cleanUrlSensitiveDataFromQuery(url);
            assert.equal(cleanedUrl, "https://example.com/oauth?access_token=***&user_name=***");
        });

        it("should handle malformed URLs by using fallback mechanism", () => {
            const url = "invalid://url with spaces?token=abc";
            const cleanedUrl = cleanUrlSensitiveDataFromQuery(url);
            // Should still sanitize using regex fallback
            assert.equal(cleanedUrl, "invalid://url with spaces?token=***");
        });
    });

    describe("cleanUrlSensitiveDataFromValue", () => {
        it("should replace sensitive data in header values with ***", () => {
            const dataValue = "client_secret=abc&token=xyz&other=123";
            const cleanedValue = cleanUrlSensitiveDataFromValue(dataValue);
            assert.equal(cleanedValue, "client_secret=***&token=***&other=123");
        });

        it("should handle values without sensitive data", () => {
            const dataValue = "other=123";
            const cleanedValue = cleanUrlSensitiveDataFromValue(dataValue);
            assert.equal(cleanedValue, "other=123");
        });

        it("should handle null or undefined values", () => {
            assert.equal(cleanUrlSensitiveDataFromValue(null), null);
            assert.equal(cleanUrlSensitiveDataFromValue(undefined), undefined);
        });

        it("should handle empty values", () => {
            assert.equal(cleanUrlSensitiveDataFromValue(""), "");
        });
    });
});
