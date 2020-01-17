var currentDate = new Date();

window.onload = function (event) {
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
    drawCalendar(currentYear, currentMonth);
}

function drawCalendar(year, month) {
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
                    calendarHtml += '<td onclick="window.location=\'task-list.html\';" class="btn-default"><h3>' + calendarDate + '</h3>';
                    var workingHours = getWorkdayHours(currentDate, calendarDate);
                    calendarHtml += '<br><div class="text-right" title="Extra minutes">' + workingHours + ' <span class="glyphicon glyphicon-time"></span></div>';
                } else {
                    calendarHtml += '<td class="btn-default" data-toggle="modal" data-target="#modalWorkdayAdder"><h3>' + calendarDate + '</h3>';
                }
                calendarHtml += '</td>';
            }
        }
        calendarHtml += "</tr>";
    }
    
    return calendarHtml;
}

function isWorkday(date, day) {
    // TODO: get data from backend
    
    return true;
}

function getWorkdayHours(date, day) {
    //TODO: get data from backend
    return 240;
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
