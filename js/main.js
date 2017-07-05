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


  $('#opt-color-rgba').colorPicker({
    noAlpha: false
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
 * @param {number}   jiggle [[Description]]
 * @param {CanvasRenderingContext2D} ctx    [[Description]]
 */
function intense(jiggle, ctx) {
  ctx.translate((Math.random() * 2 - 1) * jiggle, (Math.random() * 2 - 1) * jiggle);
}


function zoom(value, ctx) {
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(value, value);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

function process(arg) {
  var framesNum = arg.frames;
  var frames = [];

  var gifWorker = new Worker("/js/stoopid-worker.js");

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

  for (let iteration = 1; iteration <= framesNum; iteration++) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    context.save();
    if (arg.intense) {
      intense(arg.intense.jiggle, context);
    }
    if (arg.zoom) {
      zoom(arg.zoom.value, context);
    }
    if (arg.rotate) {
      rotate(iteration, framesNum, Math.PI * 2, context);
    }
    context.drawImage(imageObj, 0, 0);

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = arg.color.rgba;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    frames.push(context.getImageData(0, 0, canvas.width, canvas.height));
    context.restore();
  }
  gifWorker.postMessage({
    size: [canvas.width, canvas.height],
    frames: frames,
    arg: arg
  });
}
