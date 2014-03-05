$(function () {
    
    var theCanvas = $("#theCanvas");
    var ctx = theCanvas[0].getContext("2d");
    //ctx.imageSmoothingEnabled = true;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    var mouse = { x: 0, y: 0 , details: "" };
    var recordArray = [], i=0;
    var interval;

    var brushSize = 10;   //initial size of the brush
    var tempDetails = "";
    var recordingInterval = 10;   //recording/playing interval - miliseconds

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
            event.preventDefault();
            readMouseXY(event);
            tempDetails += "n";
            tempDetails += "b" + ("00" + brushSize).substr(-2);
            record(true, tempDetails);
            beginDraw();
            //draw();

            $("body").bind("mousemove", function (event) {
                event.preventDefault();
                readMouseXY(event);
                interval = setTimeout(function () {
                    record(true);
                    draw();
                }, recordingInterval);
            });


            $("body").bind("mouseup", function (event) {
                record(false);
                $("body").unbind("mousemove");
                $("body").unbind("mouseup");
                
            });
        });
        //mouse bindings end

    } else {
        //touch bndings
        theCanvas[0].addEventListener('touchstart', function (event) {
            event.preventDefault();
            readTouchXY(event);
            tempDetails += "n";
            tempDetails += "b" + ("00" + brushSize).substr(-2);
            record(true, tempDetails);
            beginDraw();
            //draw();

            theCanvas[0].addEventListener('touchmove', function (event) {
                event.preventDefault();
                readTouchXY(event);
                nterval = setTimeout(function () {
                    record(true);
                    draw();
                }, 10);
            }, false);

            theCanvas[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                record(false);
                theCanvas[0].removeEventListener('touchmove');
                theCanvas[0].removeEventListener('touchend');
            }, false);

        }, false);
        //touch bindings end
    }

    //buttons binding
    $("#replayBut").first().click(function () {
        replay();
    });

    $("#resetBut").first().click(function () {
        recordArray.length = 0; i = 0;
        clearInterval(interval);
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


    //initialising draw (used when mouse button down)
    function beginDraw() {
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(mouse.x+0.01, mouse.y+0.01);
        ctx.lineWidth = brushSize;
        ctx.stroke();
    }

    //drawing (used on mousemove)
    function draw() {
        //var xc, yc;
          //  xc = (recordArray[i-1].x + mouse.x) / 2;
            //yc = (recordArray[i-1].y + mouse.y) / 2;
            ctx.lineTo(recordArray[i-1].x, recordArray[i-1].y);
            //ctx.quadraticCurveTo(recordArray[i-1].x, recordArray[i-1].y, xc, yc);

            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(recordArray[i - 1].x, recordArray[i - 1].y);
            clearTimeout(interval);
    }


    //recording mousedown
    function record(active, newlineDetails) {
        recordArray[i] = mouse.constructor();
        recordArray[i].x = mouse.x;
        recordArray[i].y = mouse.y;
        recordArray[i].details = newlineDetails;
        tempDetails = "";
        console.log("REC" + recordArray[i].x + "  " + recordArray[i].y + "  " + recordArray[i].details);
        i++;
    }

    //replaying the recording
    function replay() {
        if (i === 0) return;
        var j = 0, xc,yc;
        ctx.clearRect(0, 0, theCanvas[0].width, theCanvas[0].height);

        //start drawing
        interval = setInterval(function () {
            if (j === recordArray.length - 1) clearInterval(interval);
            
            //check for new line
            if (/n/.test(recordArray[j].details)&&(recordArray[j].details !==undefined)) {
                console.log("Test: " + (/n+/.test(recordArray[j+1].details)));
                ctx.beginPath();
                ctx.moveTo(recordArray[j].x, recordArray[j].y);
                ctx.lineTo(recordArray[j].x+2, recordArray[j].y+2);
                
                //check for brush size change
                if (/b/.test(recordArray[j].details)) {
                    ctx.lineWidth = recordArray[j].details.substr(recordArray[j].details.indexOf("b") + 1, 2);
                    brushSize = ctx.lineWidth;
                    $("#slider").val(brushSize);
                    $("#brushSizeSpan")[0].innerHTML = brushSize;
                }

            } else {
                if 
                  (Math.sqrt(
                        Math.pow(recordArray[j - 1].x - recordArray[j].x,2)+
                        Math.pow(recordArray[j - 1].y - recordArray[j].y,2)
                        )>5){                                                   // <- minimum distance to do the quadraticCurve
                    xc = (recordArray[j-1].x + recordArray[j].x) / 2;
                    yc = (recordArray[j-1].y + recordArray[j].y) / 2;
                    //ctx.lineTo(recordArray[j].x, recordArray[j].y);
                    ctx.quadraticCurveTo(recordArray[j-1].x, recordArray[j-1].y, xc, yc);
                    console.log(recordArray[j].x + "  " + recordArray[j].y + "   " + recordArray[j].details);
                    //ctx.strokeStyle = "darkblue";
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(xc, yc);
                } else {
                    ctx.lineTo(recordArray[j - 1].x, recordArray[j - 1].y);
                    //ctx.strokeStyle = "black";
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(recordArray[j-1].x, recordArray[j-1].y);
                }
            }
            j++;
        }, recordingInterval);  //end start drwawing

    }// end replay

});