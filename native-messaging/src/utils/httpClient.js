const HTTP_ERROR_CODES = [429, 503, 502, 504, 440, 400, 401, 403, 404, 500];

export class HttpClient {

    constructor(headers){
        this.headers = headers;
    }

    setHeaders(headers){
        this.headers = headers;
    }

    _mergeHeaders(additionalHeaders){
        if (!additionalHeaders) return this.headers;
        return {...this.headers, ...additionalHeaders};
    }

    abortController(timeoutMs = 25_000){
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            console.log('Request timed out');
            controller.abort();
        }, timeoutMs);
        return {controller, timeout};
    }

    async post(url, body, additionalHeaders = null){

        const {controller, timeout} = this.abortController();

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: this._mergeHeaders(additionalHeaders),
                body: JSON.stringify(body),
                credentials: "include",
                signal: controller.signal
            });
            if (HTTP_ERROR_CODES.includes(res.status)) {
                let errorBody = null;
                try {
                    errorBody = await res.json();
                    console.log(errorBody);
                } catch(_){}
                return {success: res.ok, status: res?.status, body: errorBody || res?.statusText};
            }
            const text = await res.text();
         //   clearTimeout(timeout);
            if (!text || text.trim() === '') return {success: res.ok , status: res.status, body: ''}
            try {
                return {success: res.ok, status: res.status, body: JSON.parse(text)};
            } catch(err){
                return {success: res.ok , status: res.status, body: text};
            }
        } catch(err) {
//            console.log(`POST Error : ${err?.status} ${err?.statusText || 'unknown'}`);
//            throw err;
            throw err;
        }
        finally {
            clearTimeout(timeout);
        }
    }

    async get(url, params, additionalHeaders = null){

        const {controller, timeout} = this.abortController();

        try {
            const parsedUrl = new URL(url);
            if (params)
                parsedUrl.search = new URLSearchParams(params).toString();

            const res = await fetch(parsedUrl, {
                method: "GET",
                headers: this._mergeHeaders(additionalHeaders),
                credentials: "include",
                signal: controller.signal
            });
//            console.log(`${res.status}`);
            if (HTTP_ERROR_CODES.includes(res.status)) {
                return {success: res.ok, status: res?.status, body: res?.statusText};  // ← caught by getDeviceTimeline's catch → {status:'error'}
            }            
            const text = await res.text();
         //   clearTimeout(timeout); // clear early — body fully received, no need to abort
            if (!text || text.trim() === '') return {success: res.ok , status: res.status, body: ''}
            try {
                return {success: res?.ok, status: res?.status, body: JSON.parse(text)};
            } catch(err){
                return {success: res?.ok , status: res?.status, body: text}
            }
        } catch(err) {
//            console.log(`GET Error : ${err?.status} ${err?.statusText || 'unknown'}`);
            if (err?.name === 'AbortError')
                throw {success: false, status: 408, body: 'Request timed out'};
            throw err;
            
            //throw err;
            //throw {success: false, status: err.errno, body: err.message};

        } finally {
            clearTimeout(timeout);
        }
    }

    async patch(url, body, additionalHeaders = null){

        const {controller, timeout} = this.abortController();

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: this._mergeHeaders(additionalHeaders),
                body: JSON.stringify(body),
                credentials: "include",
                signal: controller.signal
            });
            if (HTTP_ERROR_CODES.includes(res.status)) {
                return {success: res.ok, status: res?.status, body: res?.statusText};  // ← caught by getDeviceTimeline's catch → {status:'error'}
            }            
            const text = await res.text();
        //    clearTimeout(timeout);
            if (!text || text.trim() === '') return {success: res.ok , status: res.status, body: ''};
            try {
                return {success: res.ok, status: res.status, body: JSON.parse(text)};
            } catch(err){
                return {success: res.ok , status: res.status, body: text}
            }
        } catch(err) {
//            console.log(`PATCH Error : ${err?.status} ${err?.statusText || 'unknown'}`);
        //    throw err;
                throw err;
        } finally {
            clearTimeout(timeout);
        }
    }

}
