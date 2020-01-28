var chosenCalendarDate = new Date();
var currentWorkingMonth;
var chosenCalendarDay = -1;

window.onload = initalizePage;

function initalizePage() {
    getWorkdaysFromBackend(chosenCalendarDate);  //We create the workmonth this way
    currentWorkingMonth = getWorkmonthFromBackend(chosenCalendarDate);
    drawPage();
    assignAllEvents();
}

function drawPage() {
    drawMonthChooserPagination();
    drawCalendarDate(chosenCalendarDate);
    drawStatistics();
}

function assignAllEvents() {
    assignMonthChooserPaginationEvents();
    assignWorkdayAdderModalEvents();
    assignConfirmWeekendModalEvents();
    assignCalendarButtonEvents();
}


function assignCalendarButtonEvents() {
    $(document).off('click', '.nonWorkDayButton');
    $(document).on('click', '.nonWorkDayButton', function () {
        chosenCalendarDay = $(this).text();
        $('#modalWorkdayAdder').modal('toggle');
    });
    
    $(document).off('click', '.workDayButton');
    $(document).on('click', '.workDayButton', function () {
        chosenCalendarDay = $(this).text();
        window.location = 'task-list.html';
    });
}

function assignWorkdayAdderModalEvents() {
    $('#modalWorkdayAdder').off("submit");
    $('#modalWorkdayAdder').submit(function(e) {
        e.preventDefault();
        
        var workdayDate = new Date(chosenCalendarDate);
        workdayDate.setDate(chosenCalendarDay);
        var workingHours = parseInt($('#workingHours').val());
        
        postWorkdayToBackend(workdayDate, workingHours);
        
        $('#modalWorkdayAdder').modal('toggle');
                
        initalizePage();
    });
}

function assignConfirmWeekendModalEvents() {
    $('#modalConfirmWeekend').off("submit");
    $('#modalConfirmWeekend').submit(function(e) {
        e.preventDefault();
        
        var workdayDate = new Date(chosenCalendarDate);
        workdayDate.setDate(chosenCalendarDay);
        var workingHours = parseInt($('#workingHours').val());
        
        postWeekendWorkdayToBackend(workdayDate, workingHours);
        
        $('#modalConfirmWeekend').modal('toggle');
                
        initalizePage();
    });
}

function assignMonthChooserPaginationEvents() {
    $("#last-month-button").off("click");
    $("#last-month-button").click(function(){
        chosenCalendarDate.setMonth(chosenCalendarDate.getMonth() - 1);
        initalizePage();
    });
    $(".choose-month-button").off("click");
    $(".choose-month-button").click(function(){
        var chosenMonth = parseInt($(this).text());
        chosenCalendarDate.setMonth(chosenMonth-1);
        initalizePage();
    });
    $("#next-month-button").off("click");
    $("#next-month-button").click(function(){
        chosenCalendarDate.setMonth(chosenCalendarDate.getMonth() + 1);
        initalizePage();
    }); 
}


function drawMonthChooserPagination() {
    $("#month-chooser").empty();
    $("#month-chooser").append('<li id="last-month-button"><a href="#">Last month</a></li>');
    for (var month = 1; month <= 12; month++) {
        var monthMenuCode = '<li class="choose-month-button';
        if (chosenCalendarDate.getMonth() + 1 === month)
            monthMenuCode += ' active';
        monthMenuCode += '"><a href="#">' + month + '</a></li>';
                
        $("#month-chooser").append(monthMenuCode);
    }
    $("#month-chooser").append('<li id="next-month-button"><a href="#">Next month</a></li>');
}


function drawStatistics() {
    var allMinutes = currentWorkingMonth.sumPerMonth;
    $('#allMinutesStatistic').empty();
    $('#allMinutesStatistic').append(allMinutes);
    
    var requiredMinutes = currentWorkingMonth.requiredMinPerMonth;
    $('#requiredMinutesStatistic').empty();
    $('#requiredMinutesStatistic').append(requiredMinutes);
    
    var extraMinutes = currentWorkingMonth.extraMinPerMonth;
    $('#extraMinutesStatistic').empty();
    $('#extraMinutesStatistic').append(extraMinutes);
    
    var className = (extraMinutes < 0) ? "negativeMinutes" : "nonNegativeMinutes";
    $('#extraMinutesStatistic').attr("class", className);
}



function drawCalendarDate(date) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    drawCalendarDateHtml(currentYear, currentMonth);
}

function drawCalendarDateHtml(year, month) {
    var calendarDays = getCalendarDays(year, month);
    calendarHtml = getCalendarHtml(calendarDays);

    $(document).ready(function(){
        $("#calendar-content").empty();
        $("#calendar-content").append(calendarHtml);
    }); 
}

function getCalendarDays(year, month) {
    var calendarDays = [];

    var dayOfFirstDay = dayOfWeek(year, month-1, 1);
    var maxDaysInLastMonth = daysInMonth(year, month - 1);
    for (var i = 0; i < dayOfFirstDay - 1; i++) {
        calendarDays.unshift(maxDaysInLastMonth - i);
    }

    var maxDaysInCurrentMonth = daysInMonth(year, month);
    for (var i = 0; i < maxDaysInCurrentMonth; i++) {
        calendarDays.push(i + 1);
    }

    var dayOfLastDay = dayOfWeek(year, month-1, maxDaysInCurrentMonth);
    for (var i = 0; i < 7 - dayOfLastDay; i++) {
        calendarDays.push(i + 1);
    }

    return calendarDays;
}
function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
function dayOfWeek(year, month, day) {
    var westernDayOfWeek = new Date(year, month, day).getDay();
    if (westernDayOfWeek == 0)
        return 7;
    else
        return westernDayOfWeek;
}


function getCalendarHtml(calendarDays) {
    var calendarHtml = "";
    
    var disableDay = true;
    for (var week = 0; week < calendarDays.length / 7; week++) {
        calendarHtml += "<tr>";
        for (var weekDay = 0; weekDay < 7; weekDay++) {
            var calendarDay = calendarDays[weekDay + week * 7];
            
            if (calendarDay === 1)
                disableDay = !disableDay;
                        
            if (disableDay) {
                calendarHtml += "<td></td>";
            } else {
                var dayIterator = calendarDays[weekDay + week * 7];
                var calendarDate = new Date(chosenCalendarDate.getFullYear(), 
                                    chosenCalendarDate.getMonth(),
                                    dayIterator);
                if (isWorkday(calendarDate)) {
                    calendarHtml += '<td class="workDayButton btn-default"><h2>' + dayIterator + '</h2>';
                    var workingHours = getWorkdayHours(calendarDate);
                    var minuteClass = workingHours >= 0 ? "nonNegativeMinutes" : "negativeMinutes"; 
                    calendarHtml += '<br><div class="' + minuteClass + ' text-right" title="Extra minutes">' + workingHours + ' <span class="glyphicon glyphicon-time"></span></div>';
                } else {
                    calendarHtml += '<td class="nonWorkDayButton btn-default"><h3><i>' + dayIterator + '</i></h3>';
                }
                calendarHtml += '</td>';
            }
        }
        calendarHtml += "</tr>";
    }
    
    return calendarHtml;
}
function isWorkday(date) {
    for (var i in currentWorkingMonth.days) {
        var actualDay = new Date(currentWorkingMonth.days[i].actualDay);
        if (actualDay.toDateString() === date.toDateString()) {
            return true;
        }
    }
    
    return false;
}
function getWorkdayHours(date) {
    for (var i in currentWorkingMonth.days) {
        var actualDay = new Date(currentWorkingMonth.days[i].actualDay);
        if (actualDay.toDateString() === date.toDateString()) {
            return currentWorkingMonth.days[i].extraMinPerDay;
        }
    }
    return null;
}


function postWorkdayToBackend(date, workingHours) {    
    var jsonData = convertWorkdayToJson(date, workingHours);
    backendPost("timelogger/workmonths/workdays", jsonData);
}

function postWeekendWorkdayToBackend(date, workingHours) {
    var jsonData = convertWorkdayToJson(date, workingHours);
    backendPost("timelogger/workmonths/weekendworkdays", jsonData);
}

function convertWorkdayToJson(date, workingHours) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDay = date.getDate();
    
    var jsonData = JSON.stringify({ year: currentYear, 
        month: currentMonth, 
        day: currentDay, 
        requiredHours: workingHours });
    
    return jsonData;
}

function getWorkdaysFromBackend(date) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var endpoint = "timelogger/workmonths/" + currentYear + "/" + currentMonth;
    return backendGet(endpoint);
}

function getWorkmonthFromBackend(date) {
    var endpoint = "timelogger/workmonths/";
    
    var allWorkMonths = backendGet(endpoint);
    
    for (var i in allWorkMonths) {
        var checkDate = new Date(allWorkMonths[i].dateString);
        if (isYearAndMonthEqual(checkDate, date)) {
            return allWorkMonths[i];
        }
    }
    return null;
}
function isYearAndMonthEqual(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth();
}


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
            var exceptionId = parseInt(e.responseText);
            handleEndpointException(exceptionId);
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
