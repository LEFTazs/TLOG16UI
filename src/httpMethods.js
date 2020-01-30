function backendGet(endpoint){
    var url = "http://" + window.location.host + "/tlog-backend/" + endpoint;

    var response = null;
    $.ajax({
        type : "GET",
        url : url,
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(result) {
            response = result;
        },
        error : function(e) {
            handleEndpointException(e);
        }
    });
    return response;
}

function backendPost(endpoint, json) {
    var url = "http://" + window.location.host + "/tlog-backend/" + endpoint;

    var response = null;
    $.ajax({
        type: "POST",
        url: url,
        async: false,
        data: json,
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            response = result;
        },
        error: function(e) {
            handleEndpointException(e);
        }
    });
    return response;
}

function backendPut(endpoint, json) {
    var url = "http://" + window.location.host + "/tlog-backend/" + endpoint;

    var response = null;
    $.ajax({
        type: "PUT",
        url: url,
        async: false,
        data: json,
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            response = result;
        },
        error: function(e) {
            handleEndpointException(e);
        }
    });
    return response;
}

function backendDelete(endpoint, json) {
    var url = "http://" + window.location.host + "/tlog-backend/" + endpoint;

    var response = null;
    $.ajax({
        type: "DELETE",
        url: url,
        async: false,
        data: json,
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            response = result;
        },
        error: function(e) {
            handleEndpointException(e);
        }
    });
    return response;
}

function handleEndpointException(exception) {
    var id = parseInt(exception.responseText);

    switch (id) {
        case WEEKEND_NOT_ENABLED_EXCEPTION:
            $('#modalConfirmWeekend').modal('toggle');
            break;
        case FUTURE_WORK_EXCEPTION:
            $('#errorInformationText').empty();
            $('#errorInformationText').append("The chosen day is in the future.<br>");
            $('#errorInformationText').append("Please choose another day.");
            $('#modalErrorInformation').modal('toggle');
            break;
        default:
            $('#errorInformationText').empty();
            $('#errorInformationText').append("Unknown error.<br>");
            $('#errorInformationText').append("Status code: " + exception.status + "<br>");
            $('#errorInformationText').append("Error id: " + id);
            $('#modalErrorInformation').modal('toggle');
            break;
    }
}

const WEEKEND_NOT_ENABLED_EXCEPTION = 1;
const FUTURE_WORK_EXCEPTION = 2;
