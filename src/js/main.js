import 'materialize-css/dist/css/materialize.min.css'
import 'jquery-ui/themes/base/all.css'
import './../less/main.less';

//import 'colorPicker';
import 'blueimp-file-upload';
import 'jquery-ui';
import 'materialize-css';
import draw from './draw.js';
$(document).ready(function () {
    $('.collapsible').collapsible({
        accordion: false,
        onOpen: (el) => $(el).find("input[type=checkbox]")[0].checked = true,
        onClose: (el) => $(el).find("input[type=checkbox]")[0].checked = false
    });
    $('.collapsible-header label').click((e) => e.preventDefault());


    $('#file').fileupload({
        pasteZone: $(document),
        replaceFileInput: false,
        fileInput: $('#file'),
        autoUpload: false,
        drop: function (e, data) {
            setFile(data.files[0]);
        },
        paste: function (e, data) {
            setFile(data.files[0]);
        }
    });


    //$('#opt-color-rgba').colorPicker({
    //    noAlpha: false
    //});

    var preview = false;
    var previewTimer;
    $('#switch-preview').change(function () {
        preview = !preview;
        if (preview) {
            $('#bitmap-container').css('display', 'none');
            clearInterval(previewTimer);
        } else {
            $('#bitmap-container').css('display', 'block');
            var arg = serializeFormData($(form));
            var iteration = 0;
            previewTimer = setInterval(() => draw(arg, iteration++, context, canvas, imageObj), arg.delay);
        }
    });
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
var outputImage = document.getElementById('image');

imageObj.addEventListener('load', () => {
    canvas.height = imageObj.height;
    canvas.width = imageObj.width;
});

file.addEventListener('change', e => setFile(e.target.files[0]));

function setFile(file) {
    imageObj.src = URL.createObjectURL(file);
    document.querySelector('.file-button-container img').src = imageObj.src;
}

form.addEventListener('submit', e => {
    e.preventDefault();

    if (imageObj.src === '') {
        Materialize.toast('Select an image!', 3000);
        return;
    }

    var arg = serializeFormData($(form));

    outputImage.src = '';

    process(arg);
});

function validateFormData() {
    //TODO: add something here
}

function process(arg) {
    var frames = [];

    var gifWorker = new Worker("./dist/stoopid-worker.js");

    var dataRegexp = /^data:image\/gif;base64,/;
    var startTime, progressBar;
    gifWorker.onmessage = function (event) {
        if (dataRegexp.test(event.data)) {
            outputImage.src = event.data;
            gifWorker.terminate();

            if (progressBar !== undefined) {
                progressBar.destroy();
            }
        } else {
            var status = JSON.parse(event.data, function (key, value) {
                if (key == "currentTime") {
                    return new Date(value);
                } else {
                    return value;
                }
            });

            if ('startTime' in status) {
                startTime = new Date(status.startTime);
                progressBar = new ProgressBar.Circle('#load-container', {
                    color: '#26A69A',
                    strokeWidth: 6
                });
            } else if (status.processed % 5) {
                var timeLeft = Math.round((status.currentTime - startTime) * (frames.length - status.processed) / status.processed / 1000);
                progressBar.animate(Math.round(status.processed / frames.length * 100) / 100);
                progressBar.setText(timeLeft);

            }
        }
    };

    canvas.height = imageObj.height;
    canvas.width = imageObj.width;

    for (let iteration = 1; iteration <= arg.frames; iteration++) {
        draw(arg, iteration, context, canvas, imageObj);
        frames.push(context.getImageData(0, 0, canvas.width, canvas.height));
    }
    gifWorker.postMessage({
        size: [canvas.width, canvas.height],
        frames: frames,
        arg: arg
    });
}
