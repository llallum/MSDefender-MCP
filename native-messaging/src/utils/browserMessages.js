
export const nativeMessages = {
    send_defender_headers: {
        source: "SOURCE",
        type: "defender_headers"
    },
    send_msgraph_authorization: {
        source: "SOURCE",
        type: "msgraph_headers",
        message: "text"
    },
    ping : {
        source: "SOURCE",
        type: "pong",
        message: Date.now()
    }
}
