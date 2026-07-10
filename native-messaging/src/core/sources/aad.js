import { log } from "../../utils/utils.js";
import { BASE_URL, ENDPOINTS } from "../endpoints.js";

export class AADClass {

    constructor(httpClient) {
        this.httpClient = httpClient;
    }


    async getAlertStory(alertId){
        const endpoint = BASE_URL + ENDPOINTS.AAD_ALERT_STORY.replace("{alertId}", alertId);
        let res = await this.httpClient.get(endpoint, {});
        return res;
    }

    async getAlertData(alertId){

        const endpoint = BASE_URL + ENDPOINTS.AAD_ALERT_DATA.replace("{alertId}", alertId);
        let res = await this.httpClient.get(endpoint);
        return res;
    }

    async getAlertContext(alertId){

        const endpoint  = BASE_URL + ENDPOINTS.AAD_ALERT_CONTEXT.replace("{alertId}", alertId);
        let res = await this.httpClient.get(endpoint);
        return res;
    }

    async getAlertInfoById(alertId, httpClient) {

        try {
            const {body: data} = await this.getAlertData(alertId);
            const {body: story} = await this.getAlertStory(alertId);
            const {body: context} = await this.getAlertContext(alertId);

            return {
                data: data,
                story: story,
                context: context
            }
        } catch (err) {
            log(err);
            return { success: false, body: err?.message || String(err) };
        }
    }

}


