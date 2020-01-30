var chosenCalendarDate;
var currentWorkday;

window.onload = initalizePage;

function initalizePage() {
    chosenCalendarDate = new Date(getCookie("taskdate"));
    currentWorkday = getWorkdayFromBackend(chosenCalendarDate);
    console.log(currentWorkday);
    
    drawPage();
    assignAllEvents();
}

function drawPage() {
    drawTaskListTable();
    drawStatistics();
}

function assignAllEvents() {
    assignTaskAdderModalEvents();
    assignTaskModifierModalEvents();
    assignTaskDeleterModalEvents();
    assignEditButtonEvents();
}


function drawTaskListTable() {
    $('#taskList').empty();
    
    var allTasks = currentWorkday.tasks;
    for (var i in allTasks) {
        var taskId = allTasks[i].taskId;
        var comment = allTasks[i].comment;
        var startTime = allTasks[i].startTime;
        var endTime = allTasks[i].endTime;
        var length = allTasks[i].minPerTask;
        
        $('#taskList').append("<tr></tr>");
        $('#taskList tr:last').append("<td>" + taskId + "</td>");
        $('#taskList tr:last').append("<td>" + comment + "</td>");
        $('#taskList tr:last').append("<td>" + startTime + "</td>");
        $('#taskList tr:last').append("<td>" + endTime + "</td>");
        $('#taskList tr:last').append("<td>" + length + "</td>");
        $('#taskList tr:last').append('<td class="modifyButton btn-default" data-rownum="' + i + '">Modify</td>' +
                                '<td class="deleteButton btn-default" data-rownum="' + i + '">Delete</td>');
    }
}

function drawStatistics() {
    var allMinutes = currentWorkday.sumPerDay;
    $('#allMinutesStatistic').empty();
    $('#allMinutesStatistic').append(allMinutes);
    
    var requiredMinutes = currentWorkday.requiredMinPerDay;
    $('#requiredMinutesStatistic').empty();
    $('#requiredMinutesStatistic').append(requiredMinutes);
    
    var extraMinutes = currentWorkday.extraMinPerDay;
    $('#extraMinutesStatistic').empty();
    $('#extraMinutesStatistic').append(extraMinutes);
    
    var className = (extraMinutes < 0) ? "negativeMinutes" : "nonNegativeMinutes";
    $('#extraMinutesStatistic').attr("class", className);
}


function assignTaskAdderModalEvents() {
    $('#modalTaskAdder').off("submit");
    $('#modalTaskAdder').submit(function(e) {
        e.preventDefault();
        
        var taskId = $('#adderTaskId').val();
        var comment = $('#adderComment').val();
        var startTime = $('#adderStartTime').val();
        var endTime = $('#adderEndTime').val();
        
        postTaskToBackend(chosenCalendarDate, taskId, comment, startTime, endTime);
        
        $('#modalTaskAdder').modal('toggle');
                
        initalizePage();
    });
}

function assignTaskModifierModalEvents() {
    $('#modalTaskModifier').off("submit");
    $('#modalTaskModifier').submit(function(e) {
        e.preventDefault();
        
        var oldTaskId = $('#modifierOldTaskId').val();
        var oldStartTime = $('#modifierOldStartTime').val();
        var newTaskId = $('#modifierNewTaskId').val();
        var newComment = $('#modifierNewComment').val();
        var newStartTime = $('#modifierNewStartTime').val();
        var newEndTime = $('#modifierNewEndTime').val();
        
        putModifyTaskToBackend(chosenCalendarDate, oldTaskId, oldStartTime, 
                                newTaskId, newComment, newStartTime, newEndTime);
        
        $('#modalTaskModifier').modal('toggle');
                
        initalizePage();
    });
}

function assignTaskDeleterModalEvents() {
    $('#modalTaskDeleter').off("submit");
    $('#modalTaskDeleter').submit(function(e) {
        e.preventDefault();
        
        var taskId = $('#deleteTaskId').val();
        var startTime = $('#deleteStartTime').val();
        
        deleteTaskFromBackend(chosenCalendarDate, taskId, startTime);
        
        $('#modalTaskDeleter').modal('toggle');
                
        initalizePage();
    });
}

function assignEditButtonEvents() {
    $(document).off('click', '.modifyButton');
    $(document).on('click', '.modifyButton', function () {
        var chosenRow = $(this).data("rownum");
        var chosenTask = currentWorkday.tasks[chosenRow];
        var taskId = chosenTask.taskId;
        var startTime = removeSecondsFromTimeString(chosenTask.startTime);
        $("#modifierOldTaskId").val(taskId);
        $("#modifierOldStartTime").val(startTime);
        $('#modalTaskModifier').modal('toggle');
    });
    
    $(document).off('click', '.deleteButton');
    $(document).on('click', '.deleteButton', function () {
        var chosenRow = $(this).data("rownum");
        var chosenTask = currentWorkday.tasks[chosenRow];
        var taskId = chosenTask.taskId;
        var startTime = removeSecondsFromTimeString(chosenTask.startTime);
        $("#deleteTaskId").val(taskId);
        $("#deleteStartTime").val(startTime);
        $('#modalTaskDeleter').modal('toggle');
    });
}


function removeSecondsFromTimeString(timeAsString) {
    var timeParts = timeAsString.split(/:/);
    return timeParts[0] + ":" + timeParts[1];
}



function convertStartTaskToJson(date, taskId, comment, startTime) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDay = date.getDate();
    
    var jsonData = JSON.stringify({ year: currentYear, 
        month: currentMonth, 
        day: currentDay,
        taskId: taskId,
        startTime: startTime,
        comment: comment });
    
    return jsonData;
}

function convertFinishTaskToJson(date, taskId, startTime, endTime) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDay = date.getDate();
    
    var jsonData = JSON.stringify({ year: currentYear, 
        month: currentMonth, 
        day: currentDay,
        taskId: taskId,
        startTime: startTime,
        endTime: endTime });
    
    return jsonData;
}

function convertModifyTaskToJson(date, taskId, startTime, newTaskId, 
                                newComment, newStartTime, newEndTime) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDay = date.getDate();
    
    var jsonData = JSON.stringify({ year: currentYear, 
        month: currentMonth, 
        day: currentDay,
        taskId: taskId,
        startTime: startTime,
        newTaskId: newTaskId,
        newComment: newComment,
        newStartTime: newStartTime,
        newEndTime: newEndTime });
    
    return jsonData;
}

function convertDeleteTaskToJson(date, taskId, startTime) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDay = date.getDate();
    
    var jsonData = JSON.stringify({ year: currentYear, 
        month: currentMonth, 
        day: currentDay,
        taskId: taskId,
        startTime: startTime });
    
    return jsonData;
}

function postTaskToBackend(date, taskId, comment, startTime, endTime) {
    var startTaskJson = convertStartTaskToJson(date, taskId, comment, startTime);
    var finishTaskJson = convertFinishTaskToJson(date, taskId, startTime, endTime);
    backendPost("/timelogger/workmonths/workdays/tasks/start", startTaskJson);
    backendPut("/timelogger/workmonths/workdays/tasks/finish", finishTaskJson);
}

function putModifyTaskToBackend(date, taskId, startTime, newTaskId, 
                                newComment, newStartTime, newEndTime) {
    var modifyTaskJson = convertModifyTaskToJson(date, taskId, startTime, newTaskId, 
                                newComment, newStartTime, newEndTime);
    backendPut("/timelogger/workmonths/workdays/tasks/modify", modifyTaskJson);
}

function deleteTaskFromBackend(date, taskId, startTime) {
    var deleteTaskJson = convertDeleteTaskToJson(date, taskId, startTime);
    backendDelete("/timelogger/workmonths/workdays/tasks/delete", deleteTaskJson);
}

function getWorkdayFromBackend(date) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var endpoint = "timelogger/workmonths/" + currentYear + "/" + currentMonth;

    var allWorkdays = backendGet(endpoint);
    
    var currentDay = date.getDate();
    for (var i in allWorkdays) {
        var checkDate = new Date(allWorkdays[i].actualDay);
        if (checkDate.getDate() === currentDay) {
            return allWorkdays[i];
        }
    }
    return null;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
} 
