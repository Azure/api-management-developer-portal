import { PortalConfigCors } from "./portalConfigCors";
import { PortalConfigCsp } from "./contentSecurityPolicy";
import { PortalConfigDelegation } from "./portalConfigDelegation";
import { PortalConfigSignup } from "./portalConfigSignup";
import { PortalConfigSignin } from "./portalConfigSignin";

export interface PortalConfig {
    enableBasicAuth: boolean;
    signin: PortalConfigSignin;
    signup: PortalConfigSignup;
    delegation: PortalConfigDelegation;
    csp: PortalConfigCsp;
    cors: PortalConfigCors;
}