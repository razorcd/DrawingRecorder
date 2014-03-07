$(function () {
    
    var theCanvas = $("#theCanvas");
    var ctx = theCanvas[0].getContext("2d");

    //set canvas size
    theCanvas.attr({ "height": theCanvas.css("height").split("px")[0] });
    theCanvas.attr({ "width": theCanvas.css("width").split("px")[0] });
    
    //set colors
    var colors = ["white","black","grey","yellow","red","blue","green","orange","purple"];
    var currentColor = colors[1];
    ctx.strokeStyle = currentColor;
    $.each($("#colors>div"), function (index, value) {
        $(value).css({ "background-color": colors[index] });
    });

    $("#colors>div").click(function () {
        $("#colors>div").removeClass("active");
        $(this).addClass("active");
        currentColor = ($(this).css("background-color"));
    });


    //ctx.imageSmoothingEnabled = true;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    var mouse = { x: 0, y: 0 , details: "" };
    var recordObj = {
        name: "unnamed",
        type: "recordObj",
        recordArray: []
    };
    var maxLocalSaves = 0;
    resetSavesTable();

    var i=0;
    var interval, playing = false, drawing = false;;

    var brushSize = 10;   //initial size of the brush
    var tempDetails = "";
    var playInterval = 35;   //recording/playing interval - miliseconds

    $("#brushSizeSpan")[0].innerHTML = brushSize;
    
    //$("#slider").slider({ min: 0, max: 100 });
    $('#slider').noUiSlider({
        range: [1, 60]
	    , start: 10
        , step: 1
        , handles: 1
        , slide: function () {
            brushSize = Math.floor($("#slider").val());
            $("#brushSizeSpan")[0].innerHTML = brushSize;
        }
    });
    //$("#slider").slider("value", brushSize);

    //$("#slider").on("slide", function (event) {
    //    brushSize = $("#slider").slider("value");
    //    $("#brushSizeSpan")[0].innerHTML = brushSize;
    //});

    if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {

        //mouse bindngs
        theCanvas.bind("mousedown", function (event) {
            if (playing) return;
            event.preventDefault();
            readMouseXY(event);
            tempDetails += "n";
            tempDetails += "b" + ("00" + brushSize).substr(-2);
            tempDetails += "c[" + currentColor + "]";
            record(true, tempDetails);
            point();
            //draw();


            $(document).bind("mousemove", function (event) {
                if (!drawing) {
                    drawing = true;
                    event.preventDefault();
                    readMouseXY(event);
                    //interval = setTimeout(function () {
                    //console.log(event);
                    record(true);
                    draw();
                    //}, playInterval);
                    drawing = false;
                }
            });


            $(document).bind("mouseup", function (event) {
                event.preventDefault();
                record(false);
                $(document).unbind("mousemove");
                $(document).unbind("mouseup");
                
            });
        });
        //mouse bindings end

    } else {
        //touch bndings
        theCanvas[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
            if (playing === false) {
                readTouchXY(event);
                tempDetails += "n";
                tempDetails += "b" + ("00" + brushSize).substr(-2);
                tempDetails += "c[" + currentColor + "]";
                record(true, tempDetails);
                point();
                //draw();

                theCanvas[0].addEventListener('touchmove', touchmoveFunc, false);
                theCanvas[0].addEventListener('touchend', touchendFunc, false);
            }
        }, false);
    }

    function touchmoveFunc(event) {
        if (!drawing) {
            drawing = true;
            event.preventDefault();
            readTouchXY(event);
            //nterval = setTimeout(function () {
            record(true);
            draw();
            drawing = false;
        }
    }

    function touchendFunc(event) {
        event.preventDefault();
        record(false);
        theCanvas[0].removeEventListener('touchmove', touchmoveFunc, false);
        theCanvas[0].removeEventListener('touchend', touchendFunc, false);
    }
    //touch bindings end


    //buttons binding
    $("#replayBut").first().click(function () {
        replay();
    });


    $("#localSaveBut").first().click(function () {
        localStorage.setItem(recordObj.name, JSON.stringify(recordObj));

        //alert(localStorage.getItem("unnamed"));
        resetSavesTable();

    });

    function resetSavesTable() {
        maxLocalSaves = 0;
        $("#savesList")[0].innerHTML = "Local Saves: <br />";
        for (var o in localStorage) {

            if (JSON.parse(localStorage[o])["type"] === "recordObj") {
                $("#savesList")[0].innerHTML += "<button class='saves'>" + JSON.parse(localStorage[o])["name"] + "</button> ";
                maxLocalSaves += 1;
            }
        }
        recordObj.name = "unnamed" + (maxLocalSaves + 1);


        $(".saves").click(function () {
            //console.log(JSON.parse(localStorage[($(this).text())]));
            //console.log(recordObj);
            recordObj = JSON.parse(localStorage[($(this).text())]);
            i = recordObj.recordArray.length;
            replay();
        });


    }

    

    $("#resetBut").first().click(function () {
        recordObj.recordArray.length = 0; i = 0;
        clearInterval(interval);
        drawing = false;
        playing = false;
        ctx.clearRect(0, 0, theCanvas[0].width, theCanvas[0].height);
    });
    //buttons binding end

    //read mouse coordinates
    function readMouseXY(event) {
        mouse.x = event.pageX - theCanvas[0].offsetLeft;
        mouse.y = event.pageY - theCanvas[0].offsetTop;
    };

    //read touch coordinates
    function readTouchXY(event) {
        var touchobj = event.changedTouches[0];
        mouse.x = touchobj.clientX - event.currentTarget.offsetLeft;
        mouse.y = touchobj.clientY - event.currentTarget.offsetTop;
    };


    //initialising draw - point (used when mouse button down)
    function point() {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 0.01, 0, 2 * Math.PI, false);
        //ctx.moveTo(mouse.x, mouse.y);
        //ctx.lineTo(mouse.x+0.01, mouse.y+0.01);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.stroke();
    }

    //drawing - line (used on mousemove)
    function draw() {
        //var xc, yc;
          //  xc = (recordObj.recordArray[i-1].x + mouse.x) / 2;
            //yc = (recordObj.recordArray[i-1].y + mouse.y) / 2;
            ctx.lineTo(recordObj.recordArray[i-1].x, recordObj.recordArray[i-1].y);
            //ctx.quadraticCurveTo(recordObj.recordArray[i-1].x, recordObj.recordArray[i-1].y, xc, yc);
            
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(recordObj.recordArray[i - 1].x, recordObj.recordArray[i - 1].y);
            //clearTimeout(interval);
    }


    //recording mousedown
    function record(active, newlineDetails) {
        recordObj.recordArray[i] = mouse.constructor();
        recordObj.recordArray[i].x = mouse.x;
        recordObj.recordArray[i].y = mouse.y;
        recordObj.recordArray[i].details = newlineDetails;
        tempDetails = "";
        console.log("REC" + recordObj.recordArray[i].x + "  " + recordObj.recordArray[i].y + "  " + recordObj.recordArray[i].details);
        i++;
    }

    //replaying the recording
    function replay() {
        clearInterval(interval);
        if (i === 0) return;
        var j = 0, xc, yc;
        playing = true;
        ctx.clearRect(0, 0, theCanvas[0].width, theCanvas[0].height);

        //start drawing
        interval = setInterval(function () {
            //check if end of drawing array
            if (j === recordObj.recordArray.length - 1) {
                clearInterval(interval);
                playing = false;
            }
            
            //check for new line
            if (/n/.test(recordObj.recordArray[j].details) && (recordObj.recordArray[j].details !== undefined)) {
                
                console.log("Test: " + (/n+/.test(recordObj.recordArray[j+1].details)));
                ctx.beginPath();
                ctx.arc(recordObj.recordArray[j].x, recordObj.recordArray[j].y, 0.01, 0, 2 * Math.PI, false);
                //if (/n/.test(recordObj.recordArray[j + 1].details)) ctx.arc(recordObj.recordArray[j].x, recordObj.recordArray[j].y, 0.01, 0, 2 * Math.PI, false);
                //else ctx.moveTo(recordObj.recordArray[j].x, recordObj.recordArray[j].y);
                //ctx.lineTo(recordObj.recordArray[j].x+2, recordObj.recordArray[j].y+2);
                
                //check for color change
                if (/c/.test(recordObj.recordArray[j].details)){
                    currentColor = recordObj.recordArray[j].details.split("c[")[1].split("]")[0];
                    ctx.strokeStyle = currentColor;
                }
                //check for brush size change
                if (/b/.test(recordObj.recordArray[j].details)) {
                    ctx.lineWidth = recordObj.recordArray[j].details.substr(recordObj.recordArray[j].details.indexOf("b") + 1, 2);
                    brushSize = ctx.lineWidth;
                    $("#slider").val(brushSize);
                    $("#brushSizeSpan")[0].innerHTML = brushSize;
                }
                j++;

            } else {
                if 
                  (Math.sqrt(
                        Math.pow(recordObj.recordArray[j - 1].x - recordObj.recordArray[j].x,2)+
                        Math.pow(recordObj.recordArray[j - 1].y - recordObj.recordArray[j].y,2)
                        ) > 10) {                                                     // <- minimum distance to do the quadraticCurve
                    //draw curve for long distances
                    xc = (recordObj.recordArray[j-1].x + recordObj.recordArray[j].x) / 2;
                    yc = (recordObj.recordArray[j-1].y + recordObj.recordArray[j].y) / 2;
                    //ctx.lineTo(recordObj.recordArray[j].x, recordObj.recordArray[j].y);
                    ctx.quadraticCurveTo(recordObj.recordArray[j-1].x, recordObj.recordArray[j-1].y, xc, yc);
                    console.log(recordObj.recordArray[j].x + "  " + recordObj.recordArray[j].y + "   " + recordObj.recordArray[j].details);
                    //ctx.strokeStyle = "rgb(" + "255" + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(xc, yc);
                } else {   //draw line for short distances
                    ctx.lineTo(recordObj.recordArray[j - 1].x, recordObj.recordArray[j - 1].y);
                    //ctx.strokeStyle = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + "255" + ")";
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(recordObj.recordArray[j-1].x, recordObj.recordArray[j-1].y);
                }
            }
            j++;
        }, playInterval);  //end start drwawing

    }// end replay

});