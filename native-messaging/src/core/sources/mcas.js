import { BASE_URL, ENDPOINTS } from "../endpoints.js";

export class MCASClass {

    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    async getAlertInfoById(alertId){
        const endpoint = BASE_URL + ENDPOINTS.MCAS_ALERT_STORY.replace("{alertId}", alertId);
        let res = await this.httpClient.get(endpoint, {});
        return res;
    }

}

