import { Contract } from "@paperbits/common";

export interface ResetPasswordContract extends Contract { 
    requireHipCaptcha: boolean;
}
