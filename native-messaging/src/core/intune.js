
import fs from "node:fs/promises"
import { readJson } from "./utils/utils.js";
import { logging } from "./utils/utils.js";

class Intune{

    constructor(token){
        this.token = token;
    }

    async getUserInfo(username){

        const msgraph_endpoint = 'https://graph.microsoft.com/beta/$batch';
        const query = "(\"displayName:" + username + "\" OR \"mail:" + username + "\" OR \"userPrincipalName:" + username + "\" OR \"givenName:" + username +"\")";

        const headers = {
            'Authorization' : this.token.headers.value.authHeader,
            'content-type' : 'application/json'
        }

        const jsonData = {
        'requests': [
            {
            'id': "searched_user",
            'method': "GET",
            'url': `/users?$search=${query}&$top=1&$count=true`,  //$select={selection}
            'headers': {
                'ConsistencyLevel': "eventual",
                'x-ms-command-name': "UserManagement - ListUsers",
                        }
                    }
                ]
            }
        
        try {
            const res = await fetch(msgraph_endpoint, 
            {
                headers: headers,
                method: "POST",
                credentials: "include",
                body: JSON.stringify(jsonData)
            })

        let result = null;
        if (res.ok){
            result = await res.json();
            return result.responses[0].body.value[0];
        }
        else {
            result = await res.json();
            if (result.error.code === 'InvalidAuthenticationToken')
                logging(result.error.code);
            return null;
        }
            
        } catch(e) {
            logging(e);
        }
    }

    async getUserCount(){

        const msgraph_endpoint = 'https://graph.microsoft.com/beta/$batch';

        const headers = {
            'Authorization' : this.token.headers.value.authHeader,
            'content-type' : 'application/json'
        }

        const jsonData = {
        'requests': [
            {
            'id': "searched_user",
            'method': "GET",
            'url': `/users?$count=true`,  //$select={selection}
            'headers': {
                'ConsistencyLevel': "eventual",
                'x-ms-command-name': "UserManagement - ListUsers",
                        }
                    }
                ]
            }

        const res = await fetch(msgraph_endpoint, 
            {
                headers: headers,
                method: "POST",
                credentials: "include",
                body: JSON.stringify(jsonData)
            })

        let result = null;
        if (res.ok){
            result = await res.json();
            return result.responses[0].body['@odata.count'];
        }
        else {
            result = await res.json();
            if (result.error.code === 'InvalidAuthenticationToken')
                logging(result.error.code);
            return null;
        }
    }

    async getAllUsers(skipToken="", userList=[]){
        const msgraph_endpoint = 'https://graph.microsoft.com/beta/$batch';
        const headers = {
            'Authorization' : this.token.headers.value.authHeader,
            'content-type' : 'application/json'
        }
        
        if (skipToken)
            skipToken = `&skiptoken=${skipToken}`;

        const jsonData = {
        'requests': [
            {
            'id': "searched_user",
            'method': "GET",
            'url': `/users?$top=999&$count=true&$orderby=displayName asc${skipToken}`,
            'headers': {
                'ConsistencyLevel': "eventual",
                'x-ms-command-name': "UserManagement - ListUsers",
                        }
                    }
                ]
            }

        const res = await fetch(msgraph_endpoint, 
            {
                headers: headers,
                method: "POST",
                credentials: "include",
                body: JSON.stringify(jsonData)
            })

        if (res.ok){
            const result = await res.json();
            console.log(result);
            const values = result.responses[0].body.value
            userList.push(...values);

            if (userList.length === result.responses[0].body['@odata.count'])
                return userList;
            const nextLink = result.responses[0].body['@odata.nextLink'];
            if (nextLink === undefined)
                return userList;

            const parsedUrl = new URL(nextLink);
            const token = parsedUrl.searchParams.get('$skiptoken') || parsedUrl.searchParams.get('skiptoken');
            return this.getAllUsers(token, userList);

        }            
    }


    async getAllDevices(skipToken="", deviceList=[]){
        const msgraph_endpoint = 'https://graph.microsoft.com/beta/$batch';
        const headers = {
            'Authorization' : this.token.headers.value.authHeader,
            'content-type' : 'application/json'
        }
        
        if (skipToken)
            skipToken = `&skiptoken=${skipToken}`;

        const jsonData = {
        'requests': [
            {
            'id': "device_name",
            'method': "GET",
            'url': `/devices?$top=999&$count=true${skipToken}`,
            'headers': {
                'ConsistencyLevel': "eventual",
                "x-ms-command-name": "DeviceManagement - ListDevices",
                        }
                    }
                ]
            }        

        const res = await fetch(msgraph_endpoint, 
            {
                headers: headers,
                method: "POST",
                credentials: "include",
                body: JSON.stringify(jsonData)
            })

        if (res.ok){
            const result = await res.json();
            console.log(result);
            const values = result.responses[0].body.value
            deviceList.push(...values);

            if (deviceList.length === result.responses[0].body['@odata.count'])
                return deviceList;
            const nextLink = result.responses[0].body['@odata.nextLink'];
            if (nextLink === undefined)
                return deviceList;

            const parsedUrl = new URL(nextLink);
            const token = parsedUrl.searchParams.get('$skiptoken') || parsedUrl.searchParams.get('skiptoken');
            return this.getAllDevices(token, deviceList);

        } 
    }

    async getAllManagedDevices(skipToken="", deviceList=[]){
        const msgraph_endpoint = 'https://graph.microsoft.com/beta/deviceManagement/managedDevices';
        const query = "(Notes eq 'bc3e5c73-e224-4e63-9b2b-0c36784b7e80')";
        const top = 999;
        const params = {
            '$filter': query,
            '$skipToken': `Skip='${skipToken}'`,
           // '$count' : true,
            '$top'  : top,                  
        };

        const headers = {
            'Authorization' : this.token.headers.value.authHeader,
            'content-type' : 'application/json'
        }

        const url = new URL(msgraph_endpoint);
        url.search = new URLSearchParams(params).toString();

        const res = await fetch(url, {
            headers: headers,
            method: "GET",
            credentials: "include",            
        });

        if (res.ok){
            const result = await res.json();
            console.log(result);
            const values = result.value;
            deviceList.push(...values);

            if (result['@odata.count'] < top)
                return deviceList;
            const nextLink = result['@odata.nextLink'];
            if (nextLink === undefined)
                return deviceList;

            const parsedUrl = new URL(nextLink);
            const token = parsedUrl.searchParams.get('$skiptoken') || parsedUrl.searchParams.get('skiptoken') || parsedUrl.searchParams.get('$skipToken');
            return this.getAllManagedDevices(token, deviceList);
        }
    }

}

if (typeof process.send != 'function'){
    const a = await readJson('./session/intune.json');
    const intune = new Intune(a);
    const userInfo = await intune.getUserInfo('llallum');
    const userCount = await intune.getUserCount();
    console.log(userCount);
    console.log(userInfo);
//    const devices = await intune.getAllDevices();
    const devices = await intune.getAllManagedDevices();
//    const allUsers = await intune.getAllUsers();
    console.log(devices);

}
