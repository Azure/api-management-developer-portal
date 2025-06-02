import { assert } from "chai";
import { describe, it } from "mocha";
import * as crypto from "crypto";
import { sanitizeUrl, cleanUpUrlParams, cleanUrlSensitiveDataFromQuery, cleanUrlSensitiveDataFromValue } from "./logSanitizer";

describe("sanitizeUrl", () => {
    it("should remove sensitive data from query parameters", () => {
        const url = "https://example.com/path?client_secret=abc&token=xyz&other=123";
        const sanitizedUrl = sanitizeUrl(url);
        assert.equal(sanitizedUrl, "https://example.com/path?client_secret=***&token=***&other=123");
    });

    it("should remove jwt data from query parameters", async () => {
        const jwt = await generateTestJwt({ testJwt: true}, "test_secret");
        const url = `https://example.com/path?test=${jwt}&token=xyz&other=123`;
        const sanitizedUrl = sanitizeUrl(url);
        assert.equal(sanitizedUrl, "https://example.com/path?test=***&token=***&other=123");
    });

       it("should remove jwt data from query part parameters", async () => {
        const jwt = await generateTestJwt({ testJwt: true}, "test_secret");
        const url = `https://example.com/path?test=Bearer+${jwt}&token=xyz&other=123`;
        const sanitizedUrl = sanitizeUrl(url);
        assert.equal(sanitizedUrl, "https://example.com/path?test=Bearer+***&token=***&other=123");
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

    it("should replace jwt data in header values with ***", async () => {
        const dataValue = `test=${await generateTestJwt({ testJwt: true}, "test_secret")}&token=xyz&other=123`;
        const cleanedValue = cleanUrlSensitiveDataFromValue(dataValue);
        assert.equal(cleanedValue, "test=***&token=***&other=123");
    });

     it("should replace all jwt data in header values with ***", async () => {
        const dataValue = `${await generateTestJwt({ testJwt: true}, "test_secret")}`;
        const cleanedValue = cleanUrlSensitiveDataFromValue(dataValue);
        assert.equal(cleanedValue, "***");
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

async function generateTestJwt(payload, secret, header = { alg: "HS256", typ: "JWT" }): Promise<string> {
    const headerEncoded = stringToBase64Url(JSON.stringify(header));
    const payloadEncoded = stringToBase64Url(JSON.stringify(payload));

    const dataToSignString = `${headerEncoded}.${payloadEncoded}`;

    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(secret); // Secret is a string, convert to Uint8Array
    const dataToSign = encoder.encode(dataToSignString);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",          // format: raw key data
        secretKeyData,  // keyData: Uint8Array of the secret
        { name: "HMAC", hash: "SHA-256" }, // algorithm details
        false,          // extractable: whether the key can be exported
        ["sign"]        // keyUsages: "sign" for HMAC
    );

    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",       // algorithm name
        cryptoKey,    // CryptoKey for signing
        dataToSign    // Data to sign as ArrayBuffer or TypedArray
    );

    const signatureEncoded = arrayBufferToBase64Url(signatureBuffer);

    return `${dataToSignString}.${signatureEncoded}`;

    function stringToBase64Url(str) {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(str);
        let binaryString = '';
        uint8Array.forEach(byte => {
            binaryString += String.fromCharCode(byte);
        });
        return btoa(binaryString)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    // Helper function to Base64URL encode an ArrayBuffer
    function arrayBufferToBase64Url(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}