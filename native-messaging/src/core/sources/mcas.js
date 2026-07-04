import { BASE_URL, ENDPOINTS } from "../endpoints.js";

class MCASClass {

    constructor(httpClient) {
        this.httpClient = httpClient;
    }


    async getAlertStory(alertId){
        const endpoint = BASE_URL + ENDPOINTS.MCAS_ALERT_STORY.replace("{alertId}", alertId);
        let res = await this.httpClient.get(endpoint, {});
        return res;
    }

}

export async function analyzeMCASAlert(alertId, httpClient) {

    const mcas = new MCASClass(httpClient);

    const res = await mcas.getAlertStory(alertId);

    return res;
    }