import { Contract } from "@paperbits/common";

export interface MarkdownContract extends Contract {
    id: string;
    compiledContent: string;
}