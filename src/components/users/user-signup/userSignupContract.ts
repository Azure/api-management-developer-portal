import { Contract } from "@paperbits/common";

export interface UserSignupContract extends Contract { 
    requireHipCaptcha: boolean;
}
