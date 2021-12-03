import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

export const htmlCodeInitial =
`<html>
<head>
    <style>
        body {
            margin: 0;
            font-family: sans-serif;
        }
    </style>
</head>
<body>
    <h1>Custom HTML widget</h1>
    <p>Write your HTML here!</p>
</body>
</html>`;

export const htmlCodeSizeStylesInitial: SizeStylePluginConfig = {
    height: "500px",
    width: "100%",
};