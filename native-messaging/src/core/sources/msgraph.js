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

    async getUserGroups(userId, select=[]){

        const endpoint = BASE_URL + ENDPOINTS.MSGRAPH_USER_GROUPS.replace('{userId}', userId);

        let params = {}

        if (select.length != 0) {
            select.join(',');
            params['$select'] = select;
        }

        const res = await this.httpClient.get(endpoint, params);
        return res;

    }
    async getUserConditionalAccessPolicies(userId){
        
        const endpoint =  BASE_URL + ENDPOINTS.MSGRAPH_USER_CA_POLICIES;

        const grpResult = await this.getUserGroups(userId, ['id', 'displayName', 'securityEnabled']);

        const groups = grpResult?.body?.value ?? [];

        const grpIds = groups
            .filter(g => g.securityEnabled)
            .map(g=> `'${g.id}'`)
            .join(',');

        const filter = `conditions/users/includeGroups/any(includeGroups:includeGroups in (${grpIds}))`;

        const params = {
            $filter : filter,
            $select: "id,displayName,conditions,grantControls,state"
        }

        const result = await this.httpClient.get(endpoint, params);

        return result;

    }

    async getUserAuthenticationMethods(userId){

        const endpoint = BASE_URL + ENDPOINTS.MSGRAPH_AUTHENTICATION.replace("{userId}", userId);
        
        let res = await this.httpClient.get(endpoint);

        return res;
    }
}

