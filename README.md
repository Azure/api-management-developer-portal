# API Management developer portal - private preview

## Overview

The API Management developer portal is based on our own fork of the [Paperbits framework](http://paperbits.io/). It has a modern default look and feel, and is optimized for:

- Customization, styling, and authoring through a visual editor.
- Programmatic access through APIs for automating the development, management, and deployment.
- Extensibility of the core functionality.

![API Management developer portal](docs/media/readme-portal.png)

## Portal components

The portal components can be logically divided into two categories: *code* and *data*.

*Code* is maintained in this repository and includes:

- Widgets - represent visual elements and combine HTML, JavaScript, styling ability, settings, and data mapping. Examples are an image, a text paragraph, a form, a list of APIs etc.
- Styling definitions - specify how widgets can be styled.
- Engine - generates static webpages from portal data and is written in JavaScript.
- Visual editor - allows for in-browser customization and authoring experience.

*Data* is divided into two subcategories: *portal data* and *API Management data*.

*Portal data* is specific to the portal and includes:

- Pages - for example, landing page, API tutorials, blog posts.
- Media - images, animations and other file-based content.
- Layouts - structure of page, including placement of widgets.
- Styles - values for styling definitions, e.g. fonts, colors, borders.
- Settings - configuration, e.g. favicon, website metadata.

*Portal data*, except for media, is expressed as JSON documents.

*API Management data* includes entities such as APIs, Operations, Products, Subscriptions.

## Managing the repositories

We extended the original Paperbits functionality to provide API Management-specific widgets (e.g., a list of APIs, or Products). We also implemented a connector to an API Management instance for saving and retrieving the content (e.g., pages, configuration, styling).

The code of the developer portal is available in [our Github repository](https://github.com/Azure/api-management-developer-portal). We will maintain it and ensure it includes the latest updates from 3rd party dependencies, including the original Paperbits project. We will also keep adding more API Management-specific features.

If you wish to have the best experience with your developer portal, you should **always merge updates from our original repository to your fork**.

When we reach the public preview stage, the repository will become publicly available.

## Development

In this section, we describe how to setup your local development environment, carry out changes in the developer portal, and publish them. We discuss alternatives for the recommended workflow in the next section.

### Requirements

To set up a local development environment, you need to have:

- API Management instance. If you don't have one, [follow this tutorial](https://docs.microsoft.com/azure/api-management/get-started-create-service-instance).
- Storage Account. Storage Account needs to have [the static websites feature](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website) enabled. You can [create a new Storage Account in Azure](https://docs.microsoft.com/azure/storage/common/storage-quickstart-create-account?tabs=azure-portal).
- Git on your machine. You can install it by following [this tutorial](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
- Node.js (LTS version, `v10.15.0` or later) and npm on your machine. You can install them by following [this tutorial](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows?view=azure-cli-latest).

### Step 1: Setup local environment

From your console window, clone apim-dev-portal repository from GitHub and install npm packages:

```sh
git clone https://github.com/Azure/api-management-developer-portal.git
cd api-management-developer-portal
npm install
```

### Step 2: Configure

The developer portal requires API Management's REST API to manage the content and a blob storage to host uploaded files (e.g., images).

#### `./src/config.design.json` file

```json
{
   "managementApiUrl": "https://<service>.management.azure-api.net",
   "managementApiVersion": "2018-06-01-preview",
   "managementApiAccessToken": "SharedAccessSignature ...",
   "blobStorageContainer": "media",
   "blobStorageUrl": "https://<account>.blob.core.windows.net?st=...",
   "environment": "development"
}
```

1. Replace `<service>` in `"managementApiUrl": "https://<service>.management.azure-api.net"` with the name of your API Management instance.
1. [Enable the direct REST API access](https://docs.microsoft.com/en-us/rest/api/apimanagement/apimanagementrest/azure-api-management-rest-api-authentication#ManuallyCreateToken) to your API Management instance. Copy the generated token and place it in the `"managementApiAccessToken": "SharedAccessSignature ..."` parameter.
1. `"blobStorageContainer"` specifies the container your media files will be uploaded to during local development. You can keep the default value, or adjust it.
1. Navigate to your Storage Account in the Azure portal. Choose the *Shared access signature* section and generate a blob service SAS URL. Paste this URL in `"blobStorageUrl": "https://<account>.blob.core.windows.net?st=..."`.

#### `./src/config.publish.json` file

```json
{
   "managementApiUrl": "https://<service>.management.azure-api.net",
   "managementApiVersion": "2018-06-01-preview",
   "managementApiAccessToken": "SharedAccessSignature ...",
   "blobStorageContainer": "media",
   "blobStorageConnectionString": "DefaultEndpointsProtocol=https;AccountName=...",
   "environment": "publishing"
}
```

1. Replace `<service>` in `"managementApiUrl": "https://<service>.management.azure-api.net"` with the name of your API Management instance.
1. Copy the `"managementApiAccessToken": "SharedAccessSignature ..."` parameter from the previous configuration file.
1. Provide the connection string to your Storage Account in the `"blobStorageConnectionString": "DefaultEndpointsProtocol=https;AccountName=..."` parameter. You can find it the *Access keys* section of your Storage Account in the Azure portal. This storage account will host your portal.
1. `"blobStorageContainer"` should have the same value as in the `./src/config.design.json` file.

#### `./src/config.runtime.json` file

```json
{
   "managementApiUrl": "https://<service>.management.azure-api.net",
   "managementApiVersion": "2018-06-01-preview",
   "environment": "runtime"
}
```

1. Replace `<service>` in `"managementApiUrl": "https://<service>.management.azure-api.net"` with the name of your API Management instance.

#### Storage Account

Configure the *Static website* feature in your Storage Account by providing routes to the index and error pages:

1. Navigate to your Storage Account in the Azure portal and click on *Static website* from the menu on the left.
1. In the field *Index document name* type *index.html*.
1. In the field *Error document path* type *404/index.html*.
1. Click *Save*.

Enable CORS:

1. Navigate to your Storage Account in the Azure portal and click on *CORS* from the menu on the left.
1. Set:
    - *Allowed origins* to **\***
    - *Allowed headers* to **\***
    - *Exposed headers* to **\***
    - *Max age* to **0**
1. Select all the HTTP verbs in the *Allowed methods* column.
1. Click *Save*.

Create the media container:

1. Navigate to your Storage Account in the Azure portal and click on *Storage Explorer* from the menu on the left.
1. Right click on *Blob containers* and select *Create blob container*.
1. Type in the name you specified in the `config.publish.json` in the `blobStorageContainer` field (default: `media`).
1. Leave the access level as *Private*.
1. Click *OK*.

### Step 3: Provision the default template

API Management instances do not have any data specific to the new developer portal, so you need to provision it manually.

First, specify your API Management service name and the REST API access token in the `scripts\generate.bat` file:

```sh
set access_token=SharedAccessSignature ...
set service_name=...
```

`access_token` is the same value that you specified in the configuration files under the `managementApiAccessToken` parameter.

Then, execute the data generation script, which will upload content through [cURL]( https://curl.haxx.se/download.html) to the Management REST API:

```sh
cd scripts
.\generate.bat
cd ..
```

If you're having troubles running the script, right click on the file and make sure that it is marked as an executable and that you have permissions to run it.

### Step 4: Run the portal

Now you can build and run a local portal instance in the development mode (with all the optimizations turned off and source maps turned on).

Execute the command:

```sh
npm start
```

It will automatically open the default browser with your local developer portal instance. Any changes to the codebase of the project will trigger a rebuild, and refresh your browser window.

### Step 5: Edit through the visual editor

You can customize your portal, author content, organize the structure of the website, and style its appearance through the built-in visual editor. If you have troubles figuring out the visual editor, this video might be helpful: https://youtu.be/Uz6kuI7JnkM

Every change will be automatically saved in your API Management instance in real-time. The next versions of the portal will feature *undo* functionality to allow you to revert accidental changes.

![API Management developer portal development - save content](docs/media/readme-dev-save.png)

### Step 6: Publish locally

The portal data is described in form of strong-typed objects. The following command will translate them into static files and place the output in the `./dist/website` directory:

```sh
npm run publish
```

![API Management developer portal development - generate static files](docs/media/readme-dev-generate.png)

### Step 7: Upload

Use Azure CLI to upload the locally generated static files to a blob, and make them accessible to your visitors:

```sh
az storage blob upload-batch --source dist/website --destination $web --account-name <account name> --account-key <account key>
```

Replace the `<account name>` and `<account key>` with the information you specified in the `./src/config.publish.json` file.

![API Management developer portal development - publish portal](docs/media/readme-dev-upload.png)

### Step 8: Visit your website

Your website is now live under the hostname specified in your Azure Storage properties (*Primary endpoint* in *Static websites*).

![API Management developer portal development - visit portal](docs/media/readme-dev-visit.png)

## Alternative development process

### Custom hosting

TODO: under construction

### Bring your own CMS

TODO: under construction

### Edit content through files, not visual editor

TODO: under construction

### Build for production

When development is complete, you may want to prepare the production build (bundle the files, exclude source maps, etc.). Create a bundle in the `./dist/designer` directory by running this command:

```sh
npm run build-designer
```

The result is a single page application, so you can still deploy it to a static web host, e.g. Azure Blob Storage Static Website.

Similarly, you can place a compiled and optimized publisher in the `./dist/publisher` folder:

```sh
npm run build-publisher
```

## Using the Function App to publish the portal

![API Management developer portal development - publish external portal](docs/media/readme-dev-publish-external.png)

Running the publishing step in the cloud is an alternative to executing it locally.

To implement it with an Azure Function App, you will need to first:

- [Create an Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-azure-function)
- Install Azure Functions Core Tools:
    ```sh
    npm install –g azure-function-core-tools
    ```

### Step 1: Configure output storage

You will be will be uploading the content directly to website hosting ("$web" container of output storage), instead of a local folder. You need to account for that in the `./src/config.publish.json` file:

```json
{
   ...
   "outputBlobStorageContainer": "$web",
   "outputBlobStorageConnectionString": "DefaultEndpointsProtocol=...",
   ...
}
```

### Step 2: Build and deploy the Function App

There is a sample HTTP Trigger Function in the `./examples` folder. To build it and place it in `./dist/function`, run the following command:

```sh
npm run build-function
```

Then, login to Azure and deploy it:

```sh
az login
cd ./dist/function
func azure functionapp publish <function app name>
```

Once it is deployed, you can invoke it with an HTTP call:

```sh
curl -X POST https://<function app name>.azurewebsites.net/api/publish
```

## APIs and entities (automation)

TODO: under construction

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ] (https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Report bugs and provide feedback

Please, submit bug reports, feedback, and feature requests through the Issues functionality on GitHub.
