# adform-upload-tool
Javascript application that handles uploading HTML assets to Adform

## Installation

```sh
npm install adform-upload-tool
```

## Basic Usage
```js
const AdformUploadTool = require('adform-upload-tool');

( async () => {

    const adformApi = new AdformUploadTool();
    const loginResult = await adformApi.login({
        client_id: 'your_client_id',
        client_secret: 'your_client_secret'
    }); //loginResult.success should be true

    // Get all clients for this account
    const clients = await adformApi.getClients();

    // Get all campaigns for this account
    const campaigns = await adformApi.getCampaigns();

    // Get all creatives by campaignId
    const campaignBanners = await adformApi.getHtmlBanners(12345);
    
    // Upload HTMl asset (zip) to specific advertiserID
    const htmlAsset = await adformApi.uploadHtmlAsset({
        advertiser: 12345,
        filePath: './path/to/banner.zip',
    });

    // Create new HTML banner in specific campaignId and Assign HTMl asset to this
    const htmlBanner = await adformApi.createHtmlBanner({
        campaignId: 12345,
        asset: htmlAsset.data,
        clickTagUrl: 'https://www.adform.com', // somehow it doesn't grab this automatically from the manifest.json.
    })
    
    // done!
    
})();
```