$(function () {
    
    var theCanvas = $("#theCanvas");
    var ctx = theCanvas[0].getContext("2d");
    var mouse = { x: 0, y: 0 , details: "" };
    var recordArray = [], i=0;
    var interval;

    //mouse bindngs
    theCanvas.bind("mousedown", function (event) {
        event.preventDefault();
        readMouseXY(event)
        record(true,"n");
        beginDraw();
        draw();

        theCanvas.bind("mousemove", function (event) {
            event.preventDefault();
            readMouseXY(event);
            record(true);
            draw();
        });
    });

    theCanvas.bind("mouseup mouseout", function (event) {
        record(false);
        theCanvas.unbind("mousemove");
    });
    //mouse bindings end



    function readMouseXY(event) {
        mouse.x = event.pageX - theCanvas[0].offsetLeft;
        mouse.y = event.pageY - theCanvas[0].offsetTop;
    };

    function beginDraw() {
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineJoin = "round";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        //ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI, false);
        //ctx.fill();

    }
    function draw() {
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }



    function record(active) {

        if (avtive) {
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

    function record(active,newlineDetails) {
        recordArray[i] = mouse.constructor();
        recordArray[i].x = mouse.x;
        recordArray[i].y = mouse.y;
        recordArray[i].details = newlineDetails;
        console.log(recordArray[i].x + "  " + recordArray[i].y + "  " + recordArray[i].details);
        i++;
    }


    $("button").first().click(function () {
        replay();

    });

    function replay() {
        var j = 0;
        ctx.clearRect(0, 0, theCanvas[0].width, theCanvas[0].height);
        ctx.beginPath();
        ctx.moveTo(recordArray[j].x, recordArray[j].y);
        j++;

        interval = setInterval(function () {
            if (j === recordArray.length - 1) clearInterval(interval);
            if (recordArray[j].details === "n") ctx.moveTo(recordArray[j].x, recordArray[j].y);
            else {
                ctx.lineTo(recordArray[j].x, recordArray[j].y);
                console.log(recordArray[j].x + "  " + recordArray[j].y);
                ctx.stroke();
            }
            j++;
        }, 10);

    }

});