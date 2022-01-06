import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

export const htmlCodeInitial =
`<html>
<head>
    <style>
        /* Custom styles */
        body {
            text-align: center;
        }
    </style>
</head>
<body>
    <fieldset>
        <h1>Custom HTML</h1>
        <p>This widget allows you to host custom HTML content. You can also add or remove the developer portal global styles.</p>
        <button class="button button-default">
           Default button
        </button>
    <fieldset>
</body>
</html>`;

export const htmlCodeSizeStylesInitial: SizeStylePluginConfig = {
    height: "300px",
    width: "100%",
};