# Azure API Management developer portal

This repository is managed by the [Microsoft Azure API Management](https://aka.ms/apimrocks) team and contains the source code of the developer portal along with instructions for setting up your own self-hosted version.

Table of contents:

- [Overview](#overview)
- [Implementation details](#implementation)
- [Self-hosted version](#self-hosted)
- [Roadmap](#roadmap)
- [Bug reports and feedback](#feedback)
- [Contributions](#contributions)
- [License](#license)

![API Management developer portal](readme/portal.png)

## <a name="overview"></a> Overview

If you're looking for **general information** on the new developer portal and its features, please refer to [the Azure update post](https://aka.ms/apimupdates/portalpreview).

If you're looking for **general documentation on the developer portal**, please refer to [Azure documentation](https://aka.ms/apimdocs/portal).

## <a name="implementation"></a> Implementation details

The portal is based on our own fork of the [Paperbits framework](http://paperbits.io/) - a [JAMstack technology](https://jamstack.org/).

We extended the original Paperbits functionality to provide API Management-specific widgets (e.g., a list of APIs, Products). We also implemented a connector to an API Management instance for saving and retrieving content (e.g., pages, configuration, styling).

## <a name="self-hosted"></a> Self-hosted version

You can deploy your own portal outside of an API Management instance. This approach allows you to edit the portal's codebase and extend the provided core functionality. For  instructions, please refer to [**documentation in the repository's Wiki section**](https://github.com/Azure/api-management-developer-portal/wiki).

## <a name="roadmap"></a> Roadmap

The project's roadmap is published in [the repository's Projects section](https://github.com/Azure/api-management-developer-portal/projects).

## <a name="feedback"></a> Bug reports and feedback

You can provide us feedback, submit a feature request, or open a bug report through [the repository's Issues section](https://github.com/Azure/api-management-developer-portal/issues).

## <a name="contributions"></a> Contributions

We welcome contributions. See the details in [the contributions file](CONTRIBUTIONS.md).

## <a name="license"></a> License

This project is published under MIT license. See the details in the [license file](license).