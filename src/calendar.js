var currentDate = new Date();
var currentWorkingDays = [];

window.onload = initalizePage();

function initalizePage() {
    currentWorkingDays = getWorkdaysFromBackend(currentDate);
    drawPage();
}

function drawPage() {
    drawMonthChooserPagination();
    drawCalendarDate(currentDate);
    assignMonthChooserPaginationEvents();
}

function assignMonthChooserPaginationEvents() {
    $("#last-month-button").click(function(){
        currentDate.setMonth(currentDate.getMonth() - 1);
        drawPage();
    });
    $(".choose-month-button").click(function(){
        var chosenMonth = parseInt($(this).text());
        currentDate.setMonth(chosenMonth-1);
        drawPage();
    }); 
    $("#next-month-button").click(function(){
        currentDate.setMonth(currentDate.getMonth() + 1);
        drawPage();
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
                calendarDate = calendarDays[weekDay + week * 7];
                if (isWorkday(currentDate, calendarDate)) {
                    calendarHtml += '<td onclick="window.location=\'task-list.html\';" class="btn-default"><h2>' + calendarDate + '</h2>';
                    var workingHours = getWorkdayHours(currentDate, calendarDate);
                    var minuteClass = workingHours >= 0 ? "nonNegativeMinutes" : "negativeMinutes"; 
                    calendarHtml += '<br><div class="' + minuteClass + ' text-right" title="Extra minutes">' + workingHours + ' <span class="glyphicon glyphicon-time"></span></div>';
                } else {
                    calendarHtml += '<td class="btn-default" data-toggle="modal" data-target="#modalWorkdayAdder"><h3><i>' + calendarDate + '</i></h3>';
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
        // The key needs to match your method's input parameter (case-sensitive).
        data: json,//JSON.stringify({ Markers: markers }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){
            console.log(data);
        },
        failure: function(errMsg) {
            console.log(errMsg);
        }
    });
}