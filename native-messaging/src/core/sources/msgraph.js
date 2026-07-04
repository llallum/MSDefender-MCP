import { BASE_URL , ENDPOINTS} from "../endpoints.js";


export default class MSGraph {

    constructor(httpClient){
        this.httpClient = httpClient;
    }

    async searchUsers(select=[], filter="", top=10, skipToken=""){

        const endpoint = BASE_URL + ENDPOINTS.MSGRAPH_USERS;
        
        const params = {
            $select : select.join(","),
            $filter : filter,
        };

        if (top) params["$top"] = top;
        if (skipToken) params["$skiptoken"] = skipToken;

        let res = await this.httpClient.get(endpoint, params);

        return res;

    }

    async searchGroups(select=[], filter="", top=10, skipToken=""){

        const endpoint = BASE_URL + ENDPOINTS.MSGRAPH_GROUPS;

        const params = {
            $select : select.join(","),
            $filter : filter,
            $orderby : "displayName asc"
        }
        
        if (top) params["$top"] = top;
        if (skipToken) params["$skiptoken"] = skipToken;

        let res = await this.httpClient.get(endpoint, params);

        return res;
    }

    async getUserAuthenticationMethods(userId){

        const endpoint = BASE_URL + ENDPOINTS.MSGRAPH_AUTHENTICATION.replace("{userId}", userId);
        
        let res = await this.httpClient.get(endpoint);

        return res;
    }
}

