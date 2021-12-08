import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

export const htmlCodeInitial =
`<html>
<head>
    <style>
        /* You can put your custom styles here */
        body {
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Custom HTML widget</h1>
    <p>Write your HTML here!</p>
    <div class="inline-block">
        <button class="button button-primary">
            Example of a styled button
        </button>
    </div>
</body>
</html>`;

export const htmlCodeSizeStylesInitial: SizeStylePluginConfig = {
    height: "500px",
    width: "100%",
};