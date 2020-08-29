/** wx.html, wx.css, wx.js 
 *  Raspberry Pi 7" touchscreen weather display
 *  TechIsSoCool.com
 */

"use strict";

//Create new Skycons object - use whatever colors you prefer, I can only vouch for sun here
let skycons = new Skycons({"monochrome": "false",
                                "color": {
                                    "main": "#fff",
                                    "light_cloud": "#EEE",
                                    "cloud": "#DDD",
                                    "dark_cloud": "#AAA",
                                    "sun": "#FF0",
                                    "moon": "#CCC",
                                    "fog": "#AAA",
                                    "thunder": "#33f",
                                    "snow": "#FFF",
                                    "hail": "#EEE",
                                    "wind": "#AAF",
                                    "leaf":"#2F2",
                                    "rain": "#0CF"
                                }, 
                            "resizeClear": "true"   
                                });

//Gets the weather data from the Node.js server, then renders the data                                
function getWx(){
    $.getJSON('http://127.0.0.1:3000/wx',
                function(data) {
                                    
                    let wxDate = new Date(data.currently.time * 1000);
                    let wxMinutes = wxDate.getMinutes();
                    if(wxMinutes < 10)
                        wxMinutes = "0" + wxMinutes.toString();
                    document.getElementById("wxLocation").innerHTML = "Weather for " + data.timezone + " time zone. <a href='https://darksky.net/poweredby/'>Powered by Dark Sky<a>";
                    document.getElementById("wxTime").innerHTML = "Updated: " + wxDate.getHours() + ":" + wxMinutes + " " + wxDate.getMonth()+1 + "/" + wxDate.getDate() + "/" +wxDate.getUTCFullYear();
                    drawCurrentConditions(data.currently);
                    drawNextConditions(data.hourly);
                    drawForecast(data.daily);
                },
                function (response) {
                    //success
                }
    );
}

function drawCurrentConditions(w){
    let span = document.getElementById("currently");
    let elem;   //current working element
    
    //Clear any existing temp display
    span.innerHTML = "";    
    
    //Label
    elem = document.createElement("div");
    elem.innerHTML = "Currently:<br>";
    span.appendChild(elem);
    
    //The current temperature
    elem = document.createElement("span");
    elem.id = 'theTempNow';
    elem.classList.add("currTemp");
    elem.innerText = Math.round(w.temperature) +"°";

    //Three digit temps break the layout, so make the font smaller if 3 digits
    //May also need to add logic for two-digit negative numbers here, but I'll never see that in my location
    if(Math.round(w.temperature) > 99){
        elem.classList.add("smallCurrTemp");
    }
    span.appendChild(elem);
    
    //canvas for the skycon icon
    elem = document.createElement("canvas");
    elem.id = "icon1"; elem.width = "150"; elem.height = "150";
    span.appendChild(elem);
    
    //fetch the icon cooresponding to the value in the JSON file and put it on the canvas
    skycons.add("icon1",w.icon);
    skycons.play();

}

function drawNextConditions(w) {
    //Label
    let span = document.getElementById("coming");
    let d = document.createElement("div");
    span.innerHTML = "";
    d.innerHTML = "Tomorrow: " + w.summary;
    span.appendChild(d);
    span.innerHTML += "<br>";
    d = document.createElement("div");
    
    //canvas for the skycon icon
    let elem = document.createElement("canvas");
    elem.id = "icon2"; elem.width = "150"; elem.height = "150";
    d.appendChild(elem);
    span.appendChild(d);
    skycons.add("icon2",w.icon);
    skycons.play();

}

function drawForecast(w){
    let weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let div = document.getElementById("forecast");
    let frDate;
    
    //build table and header row
    let table = document.createElement("table");
    let trow = document.createElement("tr");
    div.innerHTML = "";
    for(let i = 0; i < w.data.length; i++) {
        frDate = new Date(w.data[i].time * 1000);
        let th = document.createElement("th");
        th.innerText = weekdays[frDate.getDay()];
        trow.appendChild(th);
    }
    table.appendChild(trow);
    
    //build forecast rows - canvases for the icons in first row
    trow = document.createElement("tr");
    for(let i = 0; i < w.data.length; i++) {
        let td = document.createElement("td");
        let cv = document.createElement("canvas");
        cv.id = "for" + i.toString();
        cv.height = "50";
        cv.width = "50";
        td.appendChild(cv);
        trow.appendChild(td);
    }
    table.appendChild(trow);
    
    //forecast high temp in second row
    trow = document.createElement("tr");
    for(let i = 0; i < w.data.length; i++) {
        let td = document.createElement("td");
        td.innerHTML = Math.round(w.data[i].temperatureHigh) + "°<br>";
        td.classList.add("foreTemp");
        trow.appendChild(td);
    }
    table.appendChild(trow);
    
    //forecast low in the third row
    trow = document.createElement("tr");
    for(let i = 0; i < w.data.length; i++) {
        let td = document.createElement("td");
        td.innerHTML = Math.round(w.data[i].temperatureLow) + "°<br>";
        td.classList.add("foreTemp");
        trow.appendChild(td);
    }
    table.appendChild(trow);
    
    //[percent chance] of [type of precip] in 4th row
    trow = document.createElement("tr");
    for(let i = 0; i < w.data.length; i++) {
        let td = document.createElement("td");
        let precipKind = w.data[i].precipType || "rain"; //It's sometimes undefined, maybe at low percentages, so defaulting to 'rain'
        td.innerHTML = "Chance of "+ precipKind +"<br>" + Math.round(w.data[i].precipProbability * 100) + "%<br>";
        trow.appendChild(td);
    }
    table.appendChild(trow);

    //stick the table in the DOM
    div.appendChild(table);

    //draw the icons on the canvases
    skycons.add("for0",w.data[0].icon);
    skycons.add("for1",w.data[1].icon);
    skycons.add("for2",w.data[2].icon);
    skycons.add("for3",w.data[3].icon);
    skycons.add("for4",w.data[4].icon);
    skycons.add("for5",w.data[5].icon);
    skycons.add("for6",w.data[6].icon);
    skycons.add("for7",w.data[7].icon);
    skycons.play();
}

function updateCurrTemp() {
    //This was addded later to get more frequent temp updates than the DarkSky API would allow at the free level.
    //The /wx2 endpoint on the Node.js now returns weather info updated every minute, from OpenWeatherMap API
    //This updates the current temp only, the rest of the info remains as-is, sourced from DarkSky
    $.getJSON('http://127.0.0.1:3000/wx2',
        function(data)
        {
            let currTemp = Math.round(data.current.temp);
            if(currTemp > 99) {
                document.getElementById('theTempNow').classList.add('smallCurrTemp');
            }
            else {
                document.getElementById('theTempNow').classList.remove('smallCurrTemp');
            }
            document.getElementById('theTempNow').innerText = currTemp.toString()  +"°";
        },
        function (response)
        {
            //success
        }
    );
}

//loads the next page in the click/touch sequence
//change to 'clock.html' to toggle between clock and weather if you don't have a 'traffic.html'
function showTraffic() {
    window.location.assign("traffic.html");
}

//kick it off
getWx();

//every hour, get updated complete weather info in a JSON from a file created by my own NodeJs server at localhost/wx
let wxLoadTimer = setInterval(getWx,3600000);   //Updates every hour

//Every minute, get updated current temp only in a JSON from a file created by my own NodeJs server at localhost/wx2
let tmpTimer = setInterval(updateCurrTemp,60000)    //Updates every minute

//register the click and touch handlers
document.getElementsByTagName("body")[0].addEventListener("touchend",showTraffic);
document.getElementsByTagName("body")[0].addEventListener("click",showTraffic);
