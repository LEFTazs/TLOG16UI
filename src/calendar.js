var currentDate = new Date();
var currentWorkingDays = [];

window.onload = initalizePage;

function initalizePage() {
    currentWorkingDays = getWorkdaysFromBackend(currentDate);
    chosenCalendarDay = -1;
    drawPage();
}

function drawPage() {
    drawMonthChooserPagination();
    drawCalendarDate(currentDate);
    assignMonthChooserPaginationEvents();
    assignModalEvents();
    assignCalendarButtonEvents();
}

var chosenCalendarDay;

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

function assignModalEvents() {
    $('#modalWorkdayAdder').off("submit");
    $('#modalWorkdayAdder').submit(function(e) {
        e.preventDefault();
        
        var workdayDate = new Date(currentDate);
        workdayDate.setDate(chosenCalendarDay);
        var workingHours = parseInt($('#workingHours').val());
        
        postWorkdayToBackend(workdayDate, workingHours);
        
        $('#modalWorkdayAdder').modal('toggle');
                
        initalizePage();
    });
}

function assignMonthChooserPaginationEvents() {
    $("#last-month-button").off("click");
    $("#last-month-button").click(function(){
        currentDate.setMonth(currentDate.getMonth() - 1);
        initalizePage();
    });
    $(".choose-month-button").off("click");
    $(".choose-month-button").click(function(){
        var chosenMonth = parseInt($(this).text());
        currentDate.setMonth(chosenMonth-1);
        initalizePage();
    });
    $("#next-month-button").off("click");
    $("#next-month-button").click(function(){
        currentDate.setMonth(currentDate.getMonth() + 1);
        initalizePage();
    }); 
}


function drawMonthChooserPagination() {
    $("#month-chooser").empty();
    $("#month-chooser").append('<li id="last-month-button"><a href="#">Last month</a></li>');
    for (var month = 1; month <= 12; month++) {
        var monthMenuCode = '<li class="choose-month-button';
        if (currentDate.getMonth() + 1 === month)
            monthMenuCode += ' active';
        monthMenuCode += '"><a href="#">' + month + '</a></li>';
                
        $("#month-chooser").append(monthMenuCode);
    }
    $("#month-chooser").append('<li id="next-month-button"><a href="#">Next month</a></li>');
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
                var calendarDate = calendarDays[weekDay + week * 7];
                if (isWorkday(currentDate, calendarDate)) {
                    calendarHtml += '<td class="workDayButton btn-default"><h2>' + calendarDate + '</h2>';
                    var workingHours = getWorkdayHours(currentDate, calendarDate);
                    var minuteClass = workingHours >= 0 ? "nonNegativeMinutes" : "negativeMinutes"; 
                    calendarHtml += '<br><div class="' + minuteClass + ' text-right" title="Extra minutes">' + workingHours + ' <span class="glyphicon glyphicon-time"></span></div>';
                } else {
                    calendarHtml += '<td class="nonWorkDayButton btn-default"><h3><i>' + calendarDate + '</i></h3>';
                }
                calendarHtml += '</td>';
            }
        }
        calendarHtml += "</tr>";
    }
    
    return calendarHtml;
}
function isWorkday(date, day) {
    var year = date.getFullYear();
    var month = date.getMonth();
    var searchDay = new Date(year, month, day);
    for (var i in currentWorkingDays) {
        var actualDay = new Date(currentWorkingDays[i].actualDay);
        if (actualDay.toDateString() === searchDay.toDateString()) {
            return true;
        }
    }
    
    return false;
}
function getWorkdayHours(date, day) {
    var year = date.getFullYear();
    var month = date.getMonth();
    var searchDay = new Date(year, month, day);
    for (var i in currentWorkingDays) {
        var actualDay = new Date(currentWorkingDays[i].actualDay);
        if (actualDay.toDateString() === searchDay.toDateString()) {
            return currentWorkingDays[i].extraMinPerDay;
        }
    }
    return null;
}


function postWorkdayToBackend(date, workingHours) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var currentDay = date.getDate();
    
    var jsonData = JSON.stringify({ year: currentYear, 
        month: currentMonth, 
        day: currentDay, 
        requiredHours: workingHours });
        
    backendPost("timelogger/workmonths/workdays", jsonData);
}

function getWorkdaysFromBackend(date) {
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    var endpoint = "timelogger/workmonths/" + currentYear + "/" + currentMonth;
    return backendGet(endpoint);
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
            console.log("GET is done.");
            response = result;
        },
        error : function(e) {
          console.log("ERROR: ", e);
        }
    });
    return response;
}

function backendPost(endpoint, json) {
    var url = "http://" + window.location.host + "/tlog-backend/" + endpoint;

    $.ajax({
        type: "POST",
        url: url,
        async: false,
        data: json,
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            console.log("POST is done.")
            console.log(result);
        },
        error: function(e) {
            console.log("ERROR: ", e);
        }
    });
}