import { AccessTokenRefresher } from './accessTokenRefresher';
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpHeader } from "@paperbits/common/http";
import { ConsoleLogger, Logger } from "@paperbits/common/logging";
import { AccessToken, IAuthenticator } from "./../authentication";
import { IApiClient } from "../clients";
import { expect } from 'chai';
import { SinonFakeTimers, useFakeTimers, stub } from 'sinon';
import * as crypto from 'crypto';
import * as moment from "moment";

describe('AccessTokenRefresher', () => {
    let settingsProvider: ISettingsProvider;
    let authenticator: IAuthenticator;
    let apiClient: IApiClient;
    let logger: Logger;
    let accessTokenRefresher: AccessTokenRefresher;
    let clock: SinonFakeTimers;

    beforeEach(() => {
        settingsProvider = {} as ISettingsProvider;
        authenticator = <any>{
            setAccessToken: async () => { },
        };
        apiClient = <any>{
            send: async () => null,
            getPortalHeader: async (header) => <HttpHeader>{ name: "test", value: header },
        };
        logger = new ConsoleLogger();
        accessTokenRefresher = new AccessTokenRefresher(settingsProvider, authenticator, apiClient, logger);
        clock = useFakeTimers({ shouldClearNativeTimers: true });
    });

    afterEach(() => {
        accessTokenRefresher?.dispose();
        clock.restore();
    });

    it('should refresh access token when it is expired', async () => {
        const settings = { backendUrl: 'https://example.com' };
        const storedAccessToken = <any>{ expiresInMs: () => 0 };

        const tokenValue = await generateTestSASToken('testUser', 'testKey');
        const newAccessToken = AccessToken.parse(tokenValue);
        const response = { headers: [{ name: 'Ocp-Apim-Sas-Token', value: newAccessToken.toString() }] };

        const authenticatorStub = stub(authenticator, 'setAccessToken').resolves();
        settingsProvider.getSettings = async () => Promise.resolve<any>(settings);
        authenticator.getStoredAccessToken = () => storedAccessToken;
        apiClient.send = async () => <any>response;

        await accessTokenRefresher['refreshToken']();

        expect(authenticatorStub.calledOnce).to.be.true;
        expect(authenticatorStub.calledWith(newAccessToken)).to.be.true;
    });

    it('should not refresh access token when it is not expired', async () => {
        const settings = { backendUrl: 'https://example.com' };
        const storedAccessToken = <any>{ expiresInMs: () => 10 * 60 * 1000 };


        const tokenValue = await generateTestSASToken('testUser', 'testKey');
        const newAccessToken = AccessToken.parse(tokenValue);
        const response = { headers: [{ name: 'Ocp-Apim-Sas-Token', value: newAccessToken.toString() }] };

        const authenticatorStub = stub(authenticator, 'setAccessToken').resolves();
        apiClient.send = async () => <any>response;
        settingsProvider.getSettings = async () => Promise.resolve<any>(settings);
        authenticator.getStoredAccessToken = () => storedAccessToken;

        await accessTokenRefresher['refreshToken']();

        expect(authenticatorStub.called).to.be.false;
    });

    it('should not refresh access token when it is missing', async () => {
        const settings = { backendUrl: 'https://example.com' };

        const tokenValue = await generateTestSASToken('testUser', 'testKey');
        const newAccessToken = AccessToken.parse(tokenValue);
        const response = { headers: [{ name: 'Ocp-Apim-Sas-Token', value: newAccessToken.toString() }] };

        const authenticatorStub = stub(authenticator, 'setAccessToken').resolves();
        apiClient.send = async () => <any>response;
        settingsProvider.getSettings = async () => Promise.resolve<any>(settings);
        authenticator.getStoredAccessToken = () => null;

        await accessTokenRefresher['refreshToken']();

        expect(authenticatorStub.called).to.be.false;
    });

    it('should handle error when refreshing access token', async () => {
        const settings = { backendUrl: 'https://example.com' };
        const storedAccessToken = <any>{ expiresInMs: () => 0 };
        const error = new Error('Unable to refresh access token.');

        const authenticatorStub = stub(authenticator, 'setAccessToken').resolves();
        apiClient.send = async () => { throw error; };
        settingsProvider.getSettings = async () => Promise.resolve<any>(settings);
        authenticator.getStoredAccessToken = () => storedAccessToken;

        await accessTokenRefresher['refreshToken']();
        expect(authenticatorStub.called).to.be.false;
    });

    async function generateTestSASToken(userId, key) {
        const now = moment(new Date(2100, 0, 1));
        const expiry = now.clone().add(3600, 'seconds');
        const expiryString = expiry.format(`YYYY-MM-DD[T]HH:mm:ss.SSSSSSS[Z]`);
        const expiryStringShort = moment(expiry).format(`YYYYMMDDHHmmss`);
        const dataToSign = `${userId}\n${expiryString}`;
        const signedData = crypto.createHmac('sha512', key).update(dataToSign).digest('base64');
        return `SharedAccessSignature ${userId}&${expiryStringShort}&${signedData}`;
    }
});