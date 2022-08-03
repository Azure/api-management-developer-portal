import { ArmResource } from "./armResource";

export interface MarkdownArmResource extends ArmResource {
    properties : {
        en_us: {
            title: string;
            content: string;
        }
    }
}