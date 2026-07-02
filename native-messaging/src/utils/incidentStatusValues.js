

export const severityValues = {
    "Informational": 32,
    "Low": 64,
    "Medium": 128,
    "High": 256
};

export const alertClassificationType = {
    'NotSet' : 'Unknown',
    'Unknown': 0,
    'FalsePositive': 10,
    'TruePositive': 20,
    'BenignPositive': 30
}

export const alertDeterminationType = {
    'Apt' : 10,
    'Malware': 20,
    'SecurityPersonnel': 30,
    'SecurityTesting': 40,
    'UnwantedSoftware': 50,
    'Other' : 60,
    'MultiStagedAttack': 70,
    'CompromisedUser': 80,
    'Phishing': 90,
    'MaliciousUserActivity': 100,
    'Clean': 110,
    'InsufficientData': 120,
    'ConfirmedUserActivity': 130,
    'LineOfBusinessApplication': 140,
}


export const alertStatusType = {
    'Unspecified' : 0,
    'Active': 1,
    'New': 2,
    'InProgress': 4,
    'Resolved': 8,
    'Hidden': 16,
//    'ResolvedValid': 32,
//    'ResolvedValidAllowed' : 64,
//    'ResolvedFalseAlarm' : 128
}


export const groupedDetermination = {

    'TruePositive': {
        'Apt' : 10,
        'Malware': 20,  
        'UnwantedSoftware': 50,  
        'Other' : 60,
        'Phishing': 90,  
        'MaliciousUserActivity': 100,
        'ConfirmedUserActivity': 130,
    },
    'BenignPositive': {
        'SecurityPersonnel': 30,
        'SecurityTesting': 40,
        'LineOfBusinessApplication': 140,
        'Other' : 60,
    },
    'FalsePositive': {
        'Clean': 110,
        'InsufficientData': 120,
        'Other' : 60,
    }
}