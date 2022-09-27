declare module "*.html" {
    const content: string;
    export default content;
}

declare module "*.liquid" {
    const content: string;
    export default content;
}

declare module "*.txt" {
    const content: string;
    export default content;
}

declare module "*!text" {
    const _: string;
    export default  _;
}