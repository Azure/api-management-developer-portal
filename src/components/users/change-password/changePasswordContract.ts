import { Contract } from "@paperbits/common";

export interface ChangePasswordContract extends Contract { 
    requireHipCaptcha: boolean;
}
