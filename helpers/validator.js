class Validator {
    static validateEventInfo(eventInfo) {
        if (eventInfo.hasOwnProperty("name") && eventInfo.hasOwnProperty("eventId") 
             && eventInfo.hasOwnProperty("description") && eventInfo.hasOwnProperty("event_date") 
            && eventInfo.hasOwnProperty("event_time") && eventInfo.hasOwnProperty("participants")) {
            return {
                "status": true,
                "message": "Validated successfully"
            };
        } else {
            return {
                "status": false,
                "message": "Event info is malformed, please provide all the parameters"
            }
        }
    }
}

module.exports = Validator;