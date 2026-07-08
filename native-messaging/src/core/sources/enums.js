

export const EmailSubmissionReason = {
    FN : 1,
    FP : 2
}

export const EmailSubmissionCategory = {
    NotJunk : 0,
    Spam: 1,
    Phishing : 2,
    Malware : 3
}

export const EmailSubmissionType = {
	Undefined : 0,
	NetworkMessageId : 1,
	MailFile : 2,
	MessageId : 3,
}

export const EmailSubmissionObjectType = {
	Mail : 1,
	URL : 2,
	Attachment : 3
}

export const EmailSubmissionConfidenceLevel = {
	Low : 0,
	High : 1,
}