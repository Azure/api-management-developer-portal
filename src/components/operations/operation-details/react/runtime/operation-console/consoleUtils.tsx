import { HttpHeader } from "@paperbits/common/http/httpHeader";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { SubscriptionState } from "../../../../../../contracts/subscription";
import { Api } from "../../../../../../models/api";
import { AuthorizationServer } from "../../../../../../models/authorizationServer";
import { ConsoleHeader } from "../../../../../../models/console/consoleHeader";
import { KnownHttpHeaders } from "../../../../../../models/knownHttpHeaders";
import { ApiService } from "../../../../../../services/apiService";
import { OAuthService } from "../../../../../../services/oauthService";
import { ProductService } from "../../../../../../services/productService";
import { UsersService } from "../../../../../../services/usersService";
import { Utils } from "../../../../../../utils";
import { OAuth2AuthenticationSettings } from "../../../../../../contracts/authenticationSettings";
import { GrantTypes, oauthSessionKey } from "../../../../../../constants";
import { SearchQuery } from "../../../../../../contracts/searchQuery";
import * as React from "react";
import { Button, Tooltip } from "@fluentui/react-components";
import { EyeOffRegular, EyeRegular } from "@fluentui/react-icons";

interface SubscriptionOption {
    name: string;
    value: string;
}

interface StoredCredentials {
    grantType: string;
    accessToken: string;
}

interface OAuthSession {
    [apiName: string]: StoredCredentials;
}

export interface ResponsePackage {
    statusCode: number;
    statusMessage: string;
    headers: HttpHeader[];
    body: any;
}

export const getAuthServers = async (api: Api, oauthService: OAuthService): Promise<AuthorizationServer[]> => {
    let associatedAuthServers: AuthorizationServer[];

    if (api.authenticationSettings?.oAuth2AuthenticationSettings?.length > 0) {
        associatedAuthServers = await oauthService.getOauthServers(api.id);
    } else if (api.authenticationSettings?.openidAuthenticationSettings?.length > 0) {
        associatedAuthServers = await oauthService.getOpenIdAuthServers(api.id);
    }

    return associatedAuthServers ? associatedAuthServers.filter(a => a.useInTestConsole) : [];
}

export const loadSubscriptionKeys = async (api: Api, apiService: ApiService, productService: ProductService, usersService: UsersService, subscriptionsPattern?: string) => {
    if (!api.subscriptionRequired) return;

    const userId = await usersService.getCurrentUserId();
    if (!userId) return;

    const subscriptionsQuery: SearchQuery = {
        pattern: subscriptionsPattern
    };

    const pageOfProducts = await apiService.getAllApiProducts(api.id);
    const products = pageOfProducts && pageOfProducts.value ? pageOfProducts.value : [];
    const allSubscriptions = await productService.getProductsAllSubscriptions(api.name, products, userId, subscriptionsQuery);
    const subscriptions = allSubscriptions.filter(subscription => subscription.state === SubscriptionState.active);
    const availableProducts = [];

    const productsSubscriptions = subscriptions.filter(subscription => !productService.isProductScope(subscription.scope, api.name));
    products.forEach(product => {
        const keys: SubscriptionOption[] = [];

        if (productsSubscriptions.length === 0) {
            return;
        }

        productsSubscriptions.forEach(subscription => {
            if (!productService.isProductScope(subscription.scope, product.name)) {
                return;
            }

            keys.push({
                name: `Primary: ${subscription.name?.trim() || subscription.primaryKey.substr(0, 4)}`,
                value: subscription.primaryKey
            });

            keys.push({
                name: `Secondary: ${subscription.name?.trim() || subscription.secondaryKey.substr(0, 4)}`,
                value: subscription.secondaryKey
            });
        });

        if (keys.length > 0) {
            availableProducts.push({ name: product.displayName, subscriptionKeys: keys });
        }
    });

    const apiSubscriptions = subscriptions.filter(subscription => productService.isProductScope(subscription.scope, api.name));
    const apiKeys: SubscriptionOption[] = [];
    apiSubscriptions.forEach(subscription => {
        apiKeys.push({
            name: `Primary: ${subscription.name?.trim() || subscription.primaryKey.substr(0, 4)}`,
            value: subscription.primaryKey
        });

        apiKeys.push({
            name: `Secondary: ${subscription.name?.trim() || subscription.secondaryKey.substr(0, 4)}`,
            value: subscription.secondaryKey
        });
    });
    if(apiKeys.length > 0) {
        availableProducts.push({ name: "Apis", subscriptionKeys: apiKeys });
    }

    // this.isSubscriptionListEmptyDueToFilter(availableProducts.length == 0 && this.subscriptionsPattern() !== undefined);
    // this.products(availableProducts);
    // this.subscriptionsLoading(false);

    // if (subscriptions.length == 0) {
    //     return;
    // }

    // if (availableProducts.length > 0 && selectFirstSubscription) {
    //     const subscriptionKey = availableProducts[0].subscriptionKeys[0];
    //     this.selectedSubscriptionKey(subscriptionKey);
    //     this.applySubscriptionKey(subscriptionKey);
    // }

    return availableProducts;
}

export const getBackendUrl = async (settingsProvider: ISettingsProvider): Promise<string> => {
    return await settingsProvider.getSetting<string>("backendUrl");
}

export const setAuthHeader = (headers: ConsoleHeader[], accessToken: string): ConsoleHeader[] => {
    const headersArray = headers ?? [];
    const oldHeader = headersArray.find(header => header.name() === KnownHttpHeaders.Authorization);

    if (oldHeader) {
        const newHeaders: ConsoleHeader[] = headersArray.map(header => {
            header.id === oldHeader.id && header.value(accessToken);
            return header;
        });

        return newHeaders;
    }

    const authHeader = new ConsoleHeader();
    authHeader.name(KnownHttpHeaders.Authorization);
    authHeader.value(accessToken);
    authHeader.description = "Authorization header.";
    authHeader.required = false;
    authHeader.secret(true);
    authHeader.type = "string";
    authHeader.inputTypeValue("password");

    headersArray.push(authHeader);

    return headersArray;
}

export const setupOAuth = async (api: Api, authServer: AuthorizationServer, headers: ConsoleHeader[], sessionManager: SessionManager) => {
    const serverName = authServer.name;

    const scopeOverride = getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);
    const storedCredentials = await getStoredCredentials(serverName, scopeOverride, sessionManager);

    let newHeaders = headers ?? [];

    if (storedCredentials) {
        //this.selectedGrantType(storedCredentials.grantType);
        newHeaders = setAuthHeader(headers, storedCredentials.accessToken);
    }

    return newHeaders;
}

const getSelectedAuthServerOverrideScope = (selectedAuthServerName: string, oAuth2Settings: OAuth2AuthenticationSettings[]): string => {
    if (selectedAuthServerName && oAuth2Settings) {
        const authServerName = selectedAuthServerName.toLowerCase();
        const setting = oAuth2Settings.find(setting => setting.authorizationServerId?.toLowerCase() == authServerName);
        return setting?.scope;
    }

    return null;
}

const getStoredCredentials = async (serverName: string, scopeOverride: string, sessionManager: SessionManager): Promise<StoredCredentials> => {
    const oauthSession = await sessionManager.getItem<OAuthSession>(oauthSessionKey);
    const recordKey = serverName + (scopeOverride ? `-${scopeOverride}` : "");
    const storedCredentials = oauthSession?.[recordKey];

    try {
        /* Trying to check if it's a JWT token and, if yes, whether it got expired. */
        const jwtToken = Utils.parseJwt(storedCredentials.accessToken.replace(/^bearer /i, ""));
        const now = new Date();

        if (now > jwtToken.exp) {
            await clearStoredCredentials(sessionManager);
            return null;
        }
    }
    catch (error) {
        // do nothing
    }

    return storedCredentials;
}

const setStoredCredentials = async (serverName: string, scopeOverride: string, grantType: string, accessToken: string, sessionManager: SessionManager): Promise<void> => {
    const oauthSession = await sessionManager.getItem<OAuthSession>(oauthSessionKey) || {};
    const recordKey = serverName + (scopeOverride ? `-${scopeOverride}` : "");

    oauthSession[recordKey] = {
        grantType: grantType,
        accessToken: accessToken
    };

    await sessionManager.setItem<object>(oauthSessionKey, oauthSession);
}

const clearStoredCredentials = async (sessionManager: SessionManager): Promise<void> => {
    await sessionManager.removeItem(oauthSessionKey);
}

export const onGrantTypeChange = async (
    api: Api,
    headers: ConsoleHeader[],
    authorizationServer: AuthorizationServer,
    grantType: string,
    sessionManager: SessionManager,
    oauthService: OAuthService
): Promise<ConsoleHeader[]> => {
    await clearStoredCredentials(sessionManager);

    if (!grantType || grantType === GrantTypes.password) {
        const authHeader = headers?.find(header => header.name() === KnownHttpHeaders.Authorization);
        if (authHeader) {
            const newHeaders = headers.filter(header => header.id !== authHeader.id);
            return [...newHeaders];
        }
        return headers;
    }

    return await authenticateOAuth(api, headers, authorizationServer, grantType, oauthService, sessionManager);
}

const authenticateOAuth = async (
    api: Api,
    headers: ConsoleHeader[],
    authorizationServer: AuthorizationServer,
    grantType: string,
    oauthService: OAuthService,
    sessionManager: SessionManager
): Promise<ConsoleHeader[]> => {
    if (!authorizationServer) return;

    const serverName = authorizationServer.name;
    const scopeOverride = getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);

    if (scopeOverride) {
        authorizationServer.scopes = [scopeOverride];
    }

    const accessToken = await oauthService.authenticate(grantType, authorizationServer, api.name);

    if (!accessToken) {
        return;
    }

    await setStoredCredentials(serverName, scopeOverride, grantType, accessToken, sessionManager);
    return setAuthHeader(headers, accessToken);
}

export const authenticateOAuthWithPassword = async (
    api: Api,
    headers: ConsoleHeader[],
    authorizationServer: AuthorizationServer,
    username: string,
    password: string,
    oauthService: OAuthService,
    sessionManager: SessionManager
): Promise<ConsoleHeader[]> => {
    if (!authorizationServer) return;

    const serverName = authorizationServer.name;
    const scopeOverride = getSelectedAuthServerOverrideScope(serverName, api.authenticationSettings?.oAuth2AuthenticationSettings);

    if (scopeOverride) {
        authorizationServer.scopes = [scopeOverride];
    }

    const accessToken = await oauthService.authenticatePassword(username, password, authorizationServer);
    await setStoredCredentials(serverName, scopeOverride, GrantTypes.password, accessToken, sessionManager);

    return setAuthHeader(headers, accessToken);
}

export function getValidationMessage(consoleParameter: {required: boolean, value:() => any}): string {
    return getValidationState(consoleParameter) === "none" ? "" : "Value is required";
}

export function getValidationState(consoleParameter: {required: boolean, value:() => any}): "none" | "error" | "warning" | "success" {
    if (consoleParameter.required && !consoleParameter.value()) {
        return "error";
    }
    return "none";
}


export const RevealSecretButton = ({showSecret, onClick}) => {
    return (
        <Tooltip content={showSecret ? "Hide secrets" : "Reveal secrets"} relationship="label">
            <Button
                icon={showSecret ? <EyeOffRegular /> : <EyeRegular />}
                appearance="subtle"
                onClick={onClick}
            />
        </Tooltip>
    )
}