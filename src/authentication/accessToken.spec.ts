import { AccessToken } from './accessToken';
import { expect } from 'chai';
import * as crypto from 'crypto';

describe('AccessToken', () => {
    describe('parseExtendedSharedAccessSignature', () => {
        const generateTestToken = (userId: string, daysValid: number, tokenSuffix: string = ''): string => {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + daysValid);

            // Format date as YYYYMMDDHHMM to match AccessToken parsing logic
            const year = expiryDate.getFullYear().toString();
            const month = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
            const day = expiryDate.getDate().toString().padStart(2, '0');
            const hour = expiryDate.getHours().toString().padStart(2, '0');
            const minute = expiryDate.getMinutes().toString().padStart(2, '0');
            const expiryShort = `${year}${month}${day}${hour}${minute}`;

            const signature = crypto.randomBytes(32).toString('base64');
            return `${userId}&${expiryShort}&${signature}${tokenSuffix}`;
        };

        it('should parse token ending with ==', () => {
            const token = generateTestToken('user123', 1, '==');
            const extendedToken = `token="${token}",refresh="true"`;

            const result = AccessToken.parse(extendedToken);

            expect(result).to.not.be.null;
            expect(result.userId).to.equal('user123');
            expect(result.value).to.equal(token);
        });

        it('should parse token ending with =', () => {
            const token = generateTestToken('user456', 1, '=');
            const extendedToken = `token="${token}",refresh="true"`;

            const result = AccessToken.parse(extendedToken);

            expect(result).to.not.be.null;
            expect(result.userId).to.equal('user456');
            expect(result.value).to.equal(token);
        });

        it('should parse token without any = suffix', () => {
            const token = generateTestToken('user789', 1);
            const extendedToken = `token="${token}",refresh="true"`;

            const result = AccessToken.parse(extendedToken);

            expect(result).to.not.be.null;
            expect(result.userId).to.equal('user789');
            expect(result.value).to.equal(token);
        });

        it('should parse token with arbitrary ending characters', () => {
            const token = generateTestToken('userABC', 1, 'xyz');
            const extendedToken = `token="${token}",refresh="true"`;

            const result = AccessToken.parse(extendedToken);

            expect(result).to.not.be.null;
            expect(result.userId).to.equal('userABC');
            expect(result.value).to.equal(token);
        });

        it('should parse token with special characters', () => {
            const token = generateTestToken('user-test_123', 1, '+/');
            const extendedToken = `token="${token}",refresh="true"`;

            const result = AccessToken.parse(extendedToken);

            expect(result).to.not.be.null;
            expect(result.userId).to.equal('user-test_123');
            expect(result.value).to.equal(token);
        });

        it('should parse token with SharedAccessSignature prefix', () => {
            const token = generateTestToken('user999', 1, '==');
            const extendedToken = `SharedAccessSignature token="${token}",refresh="true"`;

            const result = AccessToken.parse(extendedToken);

            expect(result).to.not.be.null;
            expect(result.userId).to.equal('user999');
            expect(result.value).to.equal(token);
        });

        it('should throw error for malformed token format', () => {
            const malformedTokens = [
                'token=invalid',  // missing quotes
                'token="',        // unclosed quote
                'token=""',       // empty token
                'invalid format', // no token= prefix
                'token="token"refresh="true"', // missing comma
            ];

            malformedTokens.forEach(malformedToken => {
                expect(() => AccessToken.parse(malformedToken)).to.throw('SharedAccessSignature token format is not valid');
            });
        });

        it('should handle edge cases correctly', () => {
            // Token with quotes in the value should be properly escaped in real scenarios
            // but our regex should handle basic cases
            const baseToken = generateTestToken('edge_user', 1);

            // Test with different refresh values
            const extendedToken1 = `token="${baseToken}",refresh="false"`;
            const extendedToken2 = `token="${baseToken}",refresh="true"`;

            expect(() => AccessToken.parse(extendedToken1)).to.not.throw();
            expect(() => AccessToken.parse(extendedToken2)).to.not.throw();
        });

        it('should correctly parse expiration date', () => {
            const token = generateTestToken('timetest', 5); // 5 days from now
            const extendedToken = `token="${token}",refresh="true"`;

            const result = AccessToken.parse(extendedToken);

            expect(result.expires).to.be.instanceof(Date);
            expect(result.expires.getTime()).to.be.greaterThan(Date.now());

            // Should expire approximately 5 days from now (with some tolerance)
            const expectedExpiry = new Date();
            expectedExpiry.setDate(expectedExpiry.getDate() + 5);
            const timeDifference = Math.abs(result.expires.getTime() - expectedExpiry.getTime());
            expect(timeDifference).to.be.lessThan(24 * 60 * 60 * 1000); // Less than 1 day difference
        });
    });

    describe('toString method for extended tokens', () => {
        it('should format SharedAccessSignature correctly', () => {
            const token = 'user123&202412311200&signature==';
            const extendedToken = `token="${token}",refresh="true"`;

            const accessToken = AccessToken.parse(extendedToken);
            const result = accessToken.toString();

            expect(result).to.equal(`SharedAccessSignature token="${token}",refresh="true"`);
        });
    });

    describe('Bearer token compatibility', () => {
        it('should still parse Bearer tokens correctly', () => {
            // Mock JWT token for testing (this is a simple test token, not a real JWT)
            const mockJwtPayload = {
                exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
                userId: 'bearer_user'
            };
            const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                Buffer.from(JSON.stringify(mockJwtPayload)).toString('base64') +
                '.signature';

            const bearerToken = `Bearer ${mockJwt}`;

            const result = AccessToken.parse(bearerToken);

            expect(result).to.not.be.null;
            expect(result.value).to.equal(mockJwt);
            expect(result.toString()).to.equal(bearerToken);
        });
    });
});
