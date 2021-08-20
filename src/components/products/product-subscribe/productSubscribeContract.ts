import { Contract } from "@paperbits/common";

export interface ProductSubscribeContract extends Contract {
	
	 /**
     * Controls whether legal text is displayed by default or not.
     */
    showTermsByDefault: boolean;

}
