import { Contract } from "@paperbits/common";

export interface SignupContract extends Contract { 
    requireHipCaptcha: boolean;
}
