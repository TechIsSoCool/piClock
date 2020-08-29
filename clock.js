/** clock.html, clock.css, clock.js 
 *  Raspberry Pi 7" touchscreen clock
 *  TechIsSoCool.com
 */
"use strict";
let theDate;

function updateTime(initializing) {
    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    if(m < 10) {    //Because single digit minutes come back without a leading zero
        m = "0" + m.toString();
    }
    let pm = 0;
    let ampms = ["AM","PM"];
    if(h > 12) {    //convert to 12 hour time and set am or pm
        pm = 1;
        h -=12;
    }
    else if(h == 12) {
        pm = 1;
    }
    else if (h == 0) {
        h=12;
    }
    
    //dim at night - 9pm to 6am in this case
    if((h >= 9 && pm == 1) || (h < 6 && pm == 0) || (h == 12 && pm == 0))
        document.getElementsByClassName("clockFace")[0].classList.add("dim");

    //Easter eggs for special days
    if((d.getMonth() == 11) && (d.getDate() == 25)) { //Christmas
        document.getElementsByClassName("clockFace")[0].style.color="green"; 
        document.getElementsByClassName("time")[0].innerHTML = h + "\u2734" + m + " ";   
        if(h == 10 || h == 12) {  //If the ":" is changed to someting wider, need to gain space
            document.getElementById("ampm").style.height="20vh";
            document.getElementById("ampm").style.fontSize="4em";
        }
    }
    else if((d.getMonth() == 1) && (d.getDate() == 14)) { //Valentine's
        document.getElementsByClassName("clockFace")[0].style.color="#ff1493";    
        document.getElementsByClassName("time")[0].innerHTML = h + "\u2665" + m + " ";
        if(h == 10 || h == 12) {  //If the ":" is changed to someting wider, need to gain space
            document.getElementById("ampm").style.height="20vh";
            document.getElementById("ampm").style.fontSize="4em";
        }
    }
    else if((d.getMonth() == 2) && (d.getDate() == 17)) { //St. Patricks Day
        document.getElementsByClassName("clockFace")[0].style.color="green";    
        document.getElementsByClassName("time")[0].innerHTML = h + "\u2663" + m + " ";
        if(h == 10 || h == 12) {  //If the ":" is changed to someting wider, need to gain space
            document.getElementById("ampm").style.height="20vh";
            document.getElementById("ampm").style.fontSize="4em";
        }
    } 
    else {
        //clear any easter aggs that no longer apply
        document.getElementsByClassName("clockFace")[0].style.color=""; 
        //display the time
        document.getElementsByClassName("time")[0].innerHTML = h + ":" + m + " ";
    }
    document.getElementById("ampm").innerHTML = ampms[pm];

    //on first run and on date change, update the day and date
    if(initializing || theDate != d.getDate())  
        updateDayDate(d);

}

function updateDayDate(d) {
  
    let weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
       
    document.getElementsByClassName("weekday")[0].innerHTML = weekdays[d.getDay()];
    document.getElementsByClassName("date")[0].innerHTML = months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    //Update global variable theDate
    theDate = d.getDate();
    
}

//loads the weather page in the browser
function showWx() {
    window.location.assign("wx.html");
}

//Start by initializing the time, passing 1 to inidicate it's the first run
updateTime(1);

//Check & Update the time every half-second
let tick = setInterval(updateTime,500);

//register listeners for click and touch to display the next screen in the sequence
document.getElementsByTagName("body")[0].addEventListener("touchend",showWx);
document.getElementsByTagName("body")[0].addEventListener("click",showWx);

