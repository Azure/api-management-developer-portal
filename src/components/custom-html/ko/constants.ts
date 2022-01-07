import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

export const htmlCodeInitial =
`<html>
<head>
    <style>
        /* Custom styles */
        body {
            text-align: left;
        }
    </style>
</head>
<body>
    <fieldset>
        <h1>Custom HTML code example</h1>
        <p>Replace this content with custom HTML code. It will be rendered in an iframe in the developer portal.</p>
        <button class="button button-default">
           Sample button
        </button>
    </fieldset>
</body>
</html>`;

export const htmlCodeSizeStylesInitial: SizeStylePluginConfig = {
    height: "300px",
    width: "100%",
};