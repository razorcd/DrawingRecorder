$(function () {
    
    var theCanvas = $("#theCanvas");
    var ctx = theCanvas[0].getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";


    var mouse = { x: 0, y: 0 , details: "" };
    var recordArray = [], i=0;
    var interval;

    var brushSize = 10;
    var tempDetails = "";

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
            draw();

            $("body").bind("mousemove", function (event) {
                event.preventDefault();
                readMouseXY(event);
                record(true);
                draw();
            });


            $("body").bind("mouseup", function (event) {
                record(false);
                $("body").unbind("mousemove");
                $("body").unbind("mouseup");
            });
        });
        //mouse bindings end
    } else {
        theCanvas[0].addEventListener('touchstart', function (event) {
            readTouchXY(event);
            tempDetails += "n";
            tempDetails += "b" + ("00" + brushSize).substr(-2);
            record(true, tempDetails);
            beginDraw();
            draw();

            theCanvas[0].addEventListener('touchmove', function (event) {
                readTouchXY(event);
                record(true);
                draw();
            }, false);

            theCanvas[0].addEventListener('touchend', function (event) {
                record(false);
                theCanvas[0].removeEventListener('touchmove');
                theCanvas[0].removeEventListener('touchend');
            }, false);

        },false);
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
        //ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI, false);
        //ctx.fill();
    }

    //drawing (used on mousemove)
    function draw() {
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }



    //recording the mousemove
    function record(active) {
        if (active) {
            interval = setInterval(function () {
                recordArray[i] = mouse.constructor();
                recordArray[i].x = mouse.x;
                recordArray[i].y = mouse.y;
                console.log(recordArray[i].x + "  " + recordArray[i].y);
                i++;
            }, 10);
        } else {
            clearInterval(interval);
        }
    }

    //recording mousedown
    function record(active, newlineDetails) {
        recordArray[i] = mouse.constructor();
        recordArray[i].x = mouse.x;
        recordArray[i].y = mouse.y;
        recordArray[i].details = newlineDetails;
        tempDetails = "";
        console.log(recordArray[i].x + "  " + recordArray[i].y + "  " + recordArray[i].details);
        i++;
    }

    //replaying the recording
    function replay() {
        if (i === 0) return;
        var j = 0;
        ctx.clearRect(0, 0, theCanvas[0].width, theCanvas[0].height);

        //start drawing
        interval = setInterval(function () {
            if (j === recordArray.length - 1) clearInterval(interval);
            
            //check for new line
            if (/n/.test(recordArray[j].details)&&(recordArray[j].details !==undefined)) {
                console.log("Test: " + (/n+/.test(recordArray[j].details)));
                ctx.beginPath();
                ctx.moveTo(recordArray[j].x, recordArray[j].y);
                ctx.lineTo(recordArray[j].x+0.01, recordArray[j].y+0.01);
                

                //check for brush size change
                if (/b/.test(recordArray[j].details)) {
                    ctx.lineWidth = recordArray[j].details.substr(recordArray[j].details.indexOf("b") + 1, 2);
                    brushSize = ctx.lineWidth;
                    $("#slider").val(brushSize);
                    $("#brushSizeSpan")[0].innerHTML = brushSize;
                }
                
            }
            else {
                ctx.lineTo(recordArray[j].x, recordArray[j].y);
                console.log(recordArray[j].x + "  " + recordArray[j].y + "   " + recordArray[j].details);
                ctx.stroke();
            }
            j++;
        }, 10);

    }

});