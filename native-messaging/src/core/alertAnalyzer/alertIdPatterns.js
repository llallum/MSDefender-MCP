export const ALERT_ID_PATTERNS = {
  // Microsoft Defender for Office 365
  MDO:  /^fa[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/,

  // Microsoft Defender for Endpoint
  MDE:  /^(da[\w\d]{8}(-[\w\d]{4}){3}-[\w\d]{10,}(_\d*)?|da[\w\d]{18}_-?\w\d{4,})$/,

  // Microsoft Defender for Cloud Apps (MCAS)
  MCAS: /^ca[a-f0-9]{24}$/,

  // Microsoft Defender for Cloud (MDC) — was incorrectly in MTP
  MDC:  /^dc[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/,

  // Microsoft Defender for Identity (MDI) — covers aa + ri prefixes
  MDI:  /^(aa|ri)[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}(_[a-z]+)?$/,

  // Microsoft Defender XDR — ra/rm + UUID format (not numeric)
  XDR:  /^(ra|rm)[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}(_[a-z]+)?$/,

  // Microsoft Defender XDR — ra/rm + numeric format (original MTP)
  MTP:  /^(ra|rm)[0-9]{18}_-?[0-9]{4,}$/,

  // AAD Identity Protection
  AAD:  /^ad[a-f0-9]{40}$/,
};


    /**
     * This function analyzes an alert ID to determine its source based on predefined patterns. It iterates through the ALERT_ID_PATTERNS object, testing the alert ID against each regex pattern. If a match is found, it returns the corresponding source. If no patterns match, it returns "unknown". This can help in categorizing alerts based on their IDs, which often contain information about their origin.
     * @param {string} alertId - The ID of the alert to be analyzed.
     * @returns {string} - The source of the alert based on its ID, or "unknown" if no patterns match.
     */
export function determineSource(alertId) {
        if (!alertId) return null;
        for (const [source, pattern] of Object.entries(ALERT_ID_PATTERNS)) {
            if (pattern.test(alertId)) {
                return source;
            }
        }
        return "unknown";
    }