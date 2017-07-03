//TODO: fix the fucking expandable and checkboxes

$(document).ready(function () {
    $('.collapsible').collapsible({
        accordion: false,
        onOpen: (el) => $(el).find("input[type=checkbox]")[0].checked = true,
        onClose: (el) => $(el).find("input[type=checkbox]")[0].checked = false
    });
    $('.collapsible-header label').click((e) => e.preventDefault());


});

function serializeFormData($form) {
    var unindexedArray = $form.serializeArray();
    var indexedArray = {};

    unindexedArray.forEach(e => {
        if (e.value == 'on') {
            e.value = true;
        } else {
            let parsed = Number.parseFloat(e.value);
            if (!Number.isNaN(parsed)) {
                e.value = parsed;
            }
        }
        e.value = e.value === 'on' ? true : e.value
    });

    unindexedArray.forEach(function (param) {
        if (param.name.indexOf('opt-') === 0) { //checking if current parameter is a part of some toggleable option
            let withoutOpt = param.name.slice(4);
            unindexedArray.some(e => {
                if (withoutOpt.indexOf(e.name) != -1) {
                    let trueParamName = withoutOpt.slice(e.name.length + 1);

                    if (typeof indexedArray[e.name] !== 'object') {
                        indexedArray[e.name] = {};
                    }
                    indexedArray[e.name][trueParamName] = param.value;
                    return true;
                } else
                    return false;
            });
        } else if (!(param.name in indexedArray)) {
            indexedArray[param.name] = param.value;
        }
    });
    return indexedArray;
}

var canvas = document.getElementById('bitmap');
var context = canvas.getContext('2d');
var file = document.getElementById('file');
var imageObj = new Image();
var form = document.getElementById('controls-form');

file.addEventListener('change', setFile);

function setFile(e) {
    imageObj.src = URL.createObjectURL(e.target.files[0]);
    document.querySelector('.file-button-container img').src = imageObj.src;
}

form.addEventListener('submit', e => {
    e.preventDefault();

    if (imageObj.src === '') {
        Materialize.toast('Select an image!', 4000);
        return;
    }

    var arg = serializeFormData($(form));

    process(arg);
});

function validateFormData() {
    //TODO: add something here
}

/**
 * Applies rotation according to current iteration, total number of frames
 * and desired angle
 * @param {number}                   iteration Current iteration
 * @param {number}                   frameNum  Total number of frames
 * @param {number}                   angle     Rotation angle (radians)
 * @param {CanvasRenderingContext2D} ctx
 */
function rotate(iteration, frameNum, angle, ctx) {
    context.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(iteration / frameNum * angle);
    context.translate(-canvas.width / 2, -canvas.height / 2);
}

/**
 * INTENSE
 * @param {number}   zoom   [[Description]]
 * @param {number}   jiggle [[Description]]
 * @param {CanvasRenderingContext2D} ctx    [[Description]]
 */
function intense(zoom, jiggle, ctx) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.translate((Math.random() * 2 - 1) * jiggle, (Math.random() * 2 - 1) * jiggle);
}

function process(arg) {
    let frames = arg.frames;

    canvas.height = imageObj.height;
    canvas.width = imageObj.width;

    var encoder = new GIFEncoder();
    encoder.setQuality(arg.quality);
    if (arg['no-loop']) {
        encoder.setRepeat(arg['no-loop']['loop-repeat-count']);
    } else {
        encoder.setRepeat(0); //auto-loop
    }

    encoder.setDelay(arg.delay);

    console.log(encoder.start());


//    context.translate(canvas.width / 2, canvas.height / 2);

    for (let iteration = 1; iteration <= frames; iteration++) {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        context.save();
        if (arg.intense) {
            intense(arg.intense.zoom, arg.intense.jiggle, context);
        }
        if (arg.rotate) {
            rotate(iteration, frames, Math.PI * 2, context);
        }
        context.drawImage(imageObj, 0, 0);
        console.log(encoder.addFrame(context));
        context.restore();
    }

    encoder.finish();
    document.getElementById('image').src = 'data:image/gif;base64,' + encode64(encoder.stream().getData())
}





/*
To add WebWorkers for animation rendering:


var frame_index,
    frame_length,
    height,
    width,
    imageData; //get it from onmessage

var encoder = new GIFEncoder(); //create a new GIFEncoder for every new job
if(frame_index == 0){
  encoder.start();
}else{
  encoder.setProperties(true, true); //started, firstFrame
}
encoder.setSize(height, width);
encoder.addFrame(imageData, true);
if(frame_length == frame_index){
  encoder.finish()
}
postMessage(frame_index + encoder.stream().getData()) //on the page, search for the GIF89a to see the frame_index


var animation_parts = new Array(frame_length);
//on the handler side:

var worker = new WebWorker('blahblahblah.js');
worker.onmessage = function(e){
  //handle stuff, like get the frame_index
  animation_parts[frame_index] = frame_data;
  //check when everything else is done and then do animation_parts.join('') and have fun
}
var imdata = context.getImageData(0,0,canvas.width,canvas.height)
var len = canvas.width * canvas.height * 4;
var imarray = [];
for(var i = 0; i < len; i++){
  imarray.push(imdata[i]);
}

worker.postMessage(frame_index + ';' + frame_length + ';' + canvas.height + ';' + canvas.width + ';' + imarray.join(','))
*/
