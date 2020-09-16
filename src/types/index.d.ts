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

declare module '*!text' {
    var _: string;
    export default  _;
}