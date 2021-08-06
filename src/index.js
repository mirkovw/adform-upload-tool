const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = class AdformAPI {
    constructor(settings) {
        this.adformApi = axios.create({
            baseURL: 'https://api.adform.com/',
            proxy: {
                host: 'localhost',
                port: 8888
            }
        })
    }

    async login(settings) {
        const token_url = 'https://id.adform.com/sts/connect/token';

        const params = new URLSearchParams()
        params.append('grant_type', settings.grant_type || 'client_credentials')
        params.append('scope', settings.scopes || 'https://api.adform.com/scope/eapi https://api.adform.com/scope/ads.api.readonly https://api.adform.com/scope/creatives.api.readonly https://api.adform.com/scope/buyer.advertisers.readonly https://api.adform.com/scope/buyer.campaigns.api.readonly')
        params.append('client_id', settings.client_id)
        params.append('client_secret', settings.client_secret)

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }

        try {
            const result = await this.adformApi.post(token_url, params, {
                headers
            })

            this.adformApi.defaults.headers.common['Authorization'] = 'Bearer ' + result.data.access_token;

            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async getClients() {
        try {
            const result = await this.adformApi.get('v1/buyer/advertisers');
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async getClient(id) {
        try {
            const result = await this.adformApi.get('/v1/buyer/advertisers/'+id);
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async getCampaigns() {
        try {
            const result = await this.adformApi.get('v1/buyer/campaigns');
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async uploadHtmlAsset(options) {
        const filePath = path.resolve(options.filePath)
        const fileName = path.basename(filePath);
        const fileData = await fs.readFile(filePath)
        const fileDataBase64 = Buffer.from(fileData).toString('base64');

        const data = {
            "AdvertiserId": options.advertiser,
            "File": {
                "FullFileName": fileName,
                "FileDataBase64": fileDataBase64
            }
        }

        try {
            const result = await this.adformApi.post('api/v1/Assets/HtmlAssets', data)
            try {
                const resultPromise = new Promise((resolve, reject) => {
                    const checkOpResult = setInterval( async () => {
                        const opResult = await this.adformApi.get(result.data._links[0].href)

                        if (opResult.data) {
                            clearInterval(checkOpResult);
                            resolve(opResult.data)
                        }
                    }, 500)
                });
                const opResult = await resultPromise;

                try {
                    const result = await this.adformApi.get(opResult.Data[0].Value._links[0].href);
                    return { success: true, data: result.data };
                } catch (err) {
                    return { success: false, error: { reason: 'Something went wrong.' }};
                }

            } catch (err) {
                return { success: false, error: { reason: 'Something went wrong.' }};
            }
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async updateHtmlAsset(options) {
        const filePath = path.resolve(options.filePath)
        const fileName = path.basename(filePath);
        const fileData = await fs.readFile(filePath)
        const fileDataBase64 = Buffer.from(fileData).toString('base64');

        const data = {
            "File": {
                "FullFileName": fileName,
                "FileDataBase64": fileDataBase64
            }
        }

        try {
            const result = await this.adformApi.put('/api/v1/Assets/HtmlAssets/'+ options.uuid +'/File', data);
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async getHtmlAsset(uuid) {
        try {
            const result = await this.adformApi.get('api/v1/Assets/HtmlAssets/'+uuid);
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }


    async createHtmlBanner(options) {
        const data = {
            "Asset": {
                "Uuid": options.asset.Value.Uuid,
                "ClickUrls": [
                    {
                        "ClickTag": options.asset.Value.ClickTags[0].Name,
                        "Title": options.asset.Value.ClickTags[0].Name,
                        "Url": options.clickTagUrl
                    }
                ],

            },
            "CampaignId": options.campaignId
        }

        try {
            const result = await this.adformApi.post('api/v1/AssetBanners/HtmlBanners', data);

            const resultPromise = new Promise((resolve, reject) => {
                const checkOpResult = setInterval( async () => {
                    const opResult = await this.adformApi.get(result.data._links[0].href)

                    if (opResult.data) {
                        clearInterval(checkOpResult);
                        resolve(opResult.data)
                    }
                }, 500)
            });
            const opResult = await resultPromise;

            try {
                const result = await this.adformApi.get(opResult.Data[0].Value._links[0].href);
                return { success: true, data: result.data };
            } catch (err) {
                return { success: false, error: { reason: 'Something went wrong.' }};
            }
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async getHtmlBanner(uuid) {
        try {
            const result = await this.adformApi.get('api/v1/AssetBanners/HtmlBanners/'+uuid);
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }

    async getHtmlBanners(id) {
        const params = {
            campaignId: id
        }

        try {
            const result = await this.adformApi.post('v1/adsmanagement/ads', {}, {
                params
            });
            return { success: true, data: result.data };
        } catch (err) {
            return { success: false, error: { reason: 'Something went wrong.' }};
        }
    }
}
