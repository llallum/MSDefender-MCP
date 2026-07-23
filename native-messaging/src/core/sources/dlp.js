import { BASE_URL, ENDPOINTS } from "../endpoints.js";

export class DLPClass {

constructor(httpClient){
    this.httpClient = httpClient;
}

async getAlertInfoById(alertId){
    const endpoint = BASE_URL + ENDPOINTS.DLP_ALERT_DATA.replace("{alertId}", alertId);
    let res = await this.httpClient.get(endpoint, {});
    return res;
}


}