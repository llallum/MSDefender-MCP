import { BASE_URL , ENDPOINTS} from "../endpoints.js";
import { getDefender } from "../../server/child.js";
 import pkg from "lodash";
 const _ = pkg;

/**
 * @param {string} base64 
 * @returns 
 */
function base64ToHex(base64) {
  // Decode base64 to raw bytes
  const binaryString = atob(base64);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  // Convert byte array to hexadecimal string
  return Array.from(byteArray, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

/**
 * 
 * @param {object} objValue 
 * @param {object} srcValue 
 * @param {string} key 
 * @returns 
 */
function customizer(objValue, srcValue, key) {
  if (key === "urlData"){
    var a = _.uniq([...objValue, ...srcValue]);
    return _.uniqBy(a, "NormalizedUrlHash");
  }
  else if (key === "attachment"){
    var a = _.uniq([...objValue, ...srcValue]);
    return _.uniqBy(a, "sha256");
  }
  else if (key === "receivedTime"){
    return new Date(objValue) < new Date(srcValue) ? objValue : srcValue;
  }
  else if (_.isArray(objValue)) {
    // Concatenate arrays and remove duplicates
    return _.uniq([...objValue, ...srcValue]);
  }
}


function mergeArrays(arrays) {
  // Merge each array into a single object using lodash mergeWith

  const mergedObject = arrays.reduce((acc, array) => {

      const itemArray = Array.isArray(array) ? array : [array];
      itemArray.forEach((item) => {
        if (!acc[item.networkMessageId] && acc) {
          acc[item.networkMessageId] = item;
        } else {
          _.mergeWith(acc[item.networkMessageId], item, customizer);
        }
      });
      return acc;
  }, {});
  // Convert the merged object back to an array
  return Object.values(mergedObject);
}

export class MDOClass {

    constructor(httpClient){
        this.httpClient = httpClient;
    }

        /**
     * @param {string} startUtc // ISO string
     * @param {string} endUtc // ISO string
     * @param {string} networkMessageId // The ID of the email message to query for in the timeline
     * @param {string} recipient // The recipient of the email message
     * @param {string} tenantId // The tenant ID to query for, default is the tenant ID associated with the current session
     * @returns The timeline events for the specified email message
     */
    async  getEmailTimeline(startUtc, endUtc, networkMessageId, recipient="", tenantId){
        let email_timeline = "https://security.microsoft.com/apiproxy/di/Find/EmailTimelineEvents";
      //  var headers = getMergedHeaders();
        let result;

        const encodeFilter = (str) => str
            .replaceAll(' ', '%20')
            .replaceAll("'", '%27');

        // In getEmailTimeline():
        let filter = `NetworkMessageId eq ${networkMessageId}`   // no quotes around GUID
                + ` and recipient eq '${recipient}'`
                + ` and StartTime eq ${startUtc}`
                + ` and EndTime eq ${endUtc}`;

        const url = `${email_timeline}?tenantid=${tenantId}&Filter=${encodeFilter(filter)}`;

        try {
            const {body} = await this.httpClient.get(url);
       //     console.log(json);
            if (body.ResultCode == 200 && body.RecordCount > 0){
                return body.ResultData;
            }
            else{
      //      console.error("null");
            }
        } catch (err) {
     //       console.log("error", err);
        }
        }
    
    /**
     * @param {string} startUtc // ISO string
     * @param {string} endUtc // ISO string
     * @param {string} messageId // The ID of the email message to query for in the quarantine
     * @returns The details of the email message with the specified ID that was received within the specified time range
     */
    async getEmailQueryMessage(startUtc, endUtc, messageId){

        var response;
        //var headers = getMergedHeaders();
        let query_message = "https://security.microsoft.com/api/QuarantineMessage/QueryMessage";
        
        var json_body = {
            "messageId": messageId,
            "receivedEndDateTime": endUtc, 
            "receivedStartDateTime": startUtc
        }
        try {
            const res = await this.httpClient.patch(query_message, json_body)
      //      console.log(res);
            return res;
        } catch (err) {
            throw err;
     //       console.log("error", err);
        }
    
    }

    /**
     * @param {string} startUtc // ISO string
     * @param {string} endUtc  // ISO string
     * @param {string} hostPathHash // The hash of the URL's host and path to query for in the threat intelligence data
     * @param {string} tenantId // The tenant ID to query for, default is the tenant ID associated with the current session
     * @returns 
     */
    async getEmailUrlDataByNormalizedURL(startUtc, endUtc, hostPathHash, tenantId=TENANT_ID){

        var threat_intel = "https://security.microsoft.com/apiproxy/di/Find/ThreatIntelMailUrlData";
        //var headers = getMergedHeaders();

        let filter = "NormalizedUrlHash any '" + hostPathHash + "'";

        var params = {
            "tenantid": tenantId,
            "startTime": startUtc, 
            "endTime": endUtc,
            "Filter": filter
        }

        let url = new URL(threat_intel);
        url.search = new URLSearchParams(params).toString();

        try {

            const {body} = await this.httpClient.get(url);

    //        console.log(json);
            if (body.ResultCode == 200 && body.RecordCount > 0){
                let data = JSON.parse(body.ResultData[0]);
                return data;
            }
            else{
    //        console.error("null");
            return null;
            }
        } catch (err) {
    //        console.log("error", err);
            return null;
        }
    }    

    /**
     * 
     * @param {string} startUtc 
     * @param {string} endUtc 
     * @param {string} networkMessageId 
     * @param {string} tenantId 
     * @returns 
     */
    async getEmailMetadata(startUtc, endUtc, emailEntity, tenantId=TENANT_ID){

        let email_metadata = BASE_URL + ENDPOINTS.MDO_EMAIL_METADATA;
        //var headers = getMergedHeaders();

    //    console.log(data);
        const filters = []
        if (emailEntity.networkMessageId)
            filters.push(`NetworkMessageId eq '${emailEntity.networkMessageId}'`)
        if (!Array.isArray(emailEntity.recipient)){
            filters.push(`Recipients.LowercaseAnalyzed eq '${emailEntity.recipient}'`);
        }

        var result;
        var params = {
            "tenantid": tenantId,
            "startTime": startUtc, 
            "endTime": endUtc,
            "PageSize": 100,
            "Filter": filters.join(" and ")
            //        "Filter": "NetworkMessageId eq '" + networkMessageId + "'"
        }
        let url = new URL(email_metadata);
        url.search = new URLSearchParams(params).toString();
        try {

            const {body} = await this.httpClient.get(email_metadata, params);

            result = body.ResultData ? body.ResultData.map((x)=> { return JSON.parse(x)}) : [];
        //    console.log(json);
        } catch (err) {
        //    console.log("error", err);
            return [];
        }

        if (result.length == 0)
            return [];

        return await Promise.all(result.map(async (entity) => {
            var attachments = (entity.AttachmentData ?? []).map((x) => {
            return { 
                sha256 : base64ToHex(x.FileHash),
                filename : x.FileName,
                malwareFamily : x.CurrentMalwareFamily,
                filesize : x.FileSize,
            }
            });

            attachments = _.uniqBy(attachments, 'sha256');
            var urlData = entity.UrlDatas ?? [];
            var urls = await Promise.all(
            urlData.map(async (x)=> {
                return await this.getEmailUrlDataByNormalizedURL(startUtc, endUtc, x.NormalizedUrlHash, tenantId=tenantId);
            }
            )).then(x => {return x;});
        
            var timeline = await this.getEmailTimeline(startUtc, endUtc, entity.NetworkMessageId, entity.Recipients[0], tenantId=tenantId);

            return { 
            networkMessageId : entity.NetworkMessageId,
            internetMessageId : entity.InternetMessageId,
            subject : entity.Subject,
            p1Sender : entity.P1Sender,      
            p2Sender : entity.P2Sender,
            p2SenderDisplay : entity.P2SenderDisplayName,
            ehloDomain : entity.EhloDomain,
            language : entity.MailLanguage,
            authentication : {
                dkim : entity.DkimAuthResult,
                spf : entity.SpfAuthResult,
                dmarc : entity.DmarcAuthResult,
                composite : entity.CompositeAuthResult
                },
            senderCountry : entity.SenderCountry,
            senderIp : entity.SenderIp,
            senderIpLocation : entity.SenderIpLocation,
            recipient : entity.Recipients,
            receivedTime : entity.ReceivedTime,
            sourceEntityId: entity.SourceEntityId,
            urlData : urls,
            attachment : attachments,
            timeline : timeline
            }
        })).then(x => {return x;});
    }

    async  getAlertInfo(data){
        var result = {
        alertId : data.alertId,
        alertType : data.alertType,
        alertDisplayName: data.alertDisplayName,
        description : data.description,
        mitreCategory : data.mitreAttackCategory,
        mitreTechnique : data.mitreAttackTechnique,
        startTimeUtc : data.startTimeUtc, 
        endTimeUtc: data.endTimeUtc,
        templateType : data.templateType,
        type : "mailMessage",
        relatedEntities : [],
        additionalData : data.additionalData
        };

        var relatedEntities = data.relatedEntities.filter((entity) => entity.type === "mailMessage");

        var startTime = new Date(result.startTimeUtc);

        startTime.setDate(startTime.getDate() - 14); //displace date by days for allowance

        const strStartTime = startTime.toISOString();
        result.relatedEntities = await Promise.all(
            (relatedEntities ?? []).map(async (x) => {
                const defenderInstance = await getDefender();
                const tenantId = await defenderInstance.getTenantId();
                return await this.getEmailMetadata(strStartTime, result.endTimeUtc, x, tenantId);
            })).then(x => {
                const flattened = x.flat();
                return flattened.filter((item)=> item!= null);

            });
        if (result.relatedEntities.every((arr ) => arr.length === 0)) {
      //      console.log("No related entities");
      //      console.log(data.relatedEntities)
      //      console.log("data ", data);

        result.relatedEntities = data.relatedEntities.map((x ) => {
        if (x != null && x.type === "mailMessage") {
            return {
            networkMessageId: x.networkMessageId,
            internetMessageId : x.internetMessageId,
            receivedTime : x.receivedDate,
            subject : x.subject,
            p2Sender : x.sender,
            senderIp : x.senderIP,
            recipient : x.recipient,
            startTimeUtc : x.startTimeUtc ?? x.receivedDate,
            p2SenderDisplay: x.p2SenderDisplayName,
            language: x.language,
            sourceEntityId: x.SourceEntityId
            }
        }

        }).filter(Boolean);
    }
    return result;
    }

    async reportEmailViaNetworkMessageId(networkMessageId, recipient=[], category, reason, confidenceLevel, submitter, tenantId){

        const emailEntity = {networkMessageId, recipient};

        const endpoint = BASE_URL  + ENDPOINTS.MDO_SUBMIT_NETWORK_MSG_ID;

        let endDate = new Date();
        let startDate  =  new Date(endDate);
        startDate.setUTCDate(startDate.getUTCDate() - 30);

        const emailMetadata = await this.getEmailMetadata(startDate.toISOString(), endDate.toISOString(), emailEntity, tenantId);

        if (!emailMetadata.length) return null;

        const merged = mergeArrays(emailMetadata)[0];

        const json_body = {
            ObjectId : networkMessageId,
            Recipients: merged.recipient,
            Sender: merged?.p2Sender,
            SubmissionContent: merged.subject,
            TenantId: tenantId,
//            OriginalSubmitter: '',
            IsApproved: true,
            SubmissionReason: reason,
            SubmissionCategory: category,
            SubmissionConfidenceLevel: confidenceLevel,
            //SenderIP : merged?.senderIp
//            EmailType: 1,
//            Type: 1,
        }
        if (submitter) json_body.originalSubmitter = submitter;

        const result = await this.httpClient.post(endpoint, [json_body]);

        return result;
    }

    async getMDOAlertData(alertId){
        let alertStory = BASE_URL + ENDPOINTS.MDO_ALERT_DATA.replace("{alertId}", alertId);
        try {
            const {body} = await this.httpClient.get(alertStory, {});
            return body;
        } catch(err){
            throw err;
        }
        
    }

    async getAlertInfoById(alertId) {

        let alertStory = BASE_URL + ENDPOINTS.MDO_ALERT_DATA.replace("{alertId}", alertId);

        let pattern = /fa[a-f0-9]{8}(\-[a-f0-9]{4}){3}\-[a-f0-9]{12}/;
        if (alertId.match(pattern) == null)
        return;

        try {
            let result = await this.getMDOAlertData(alertId);
            let alertInfo = await this.getAlertInfo(result);
            let mergedEntities = mergeArrays(alertInfo.relatedEntities);
    //        console.log(c);
            alertInfo.relatedEntities = mergedEntities;
    //        alertInfo.additionalData = result.additionalData;
            return alertInfo;
        } catch (err) {
            //log(err);
            return err;
        }

    }

}

