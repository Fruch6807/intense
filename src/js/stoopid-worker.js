importScripts("/static/lib/b64.js",
    "/static/lib/LZWEncoder.js",
    "/static/lib/NeuQuant.js",
    "/static/lib/GIFEncoder.js");



self.addEventListener("message", function (event) {
    var data = event.data;
    var arg = data.arg;

    var encoder = new GIFEncoder();
    encoder.setQuality(arg.quality);
    if (arg['no-loop']) {
        encoder.setRepeat(arg['no-loop']['loop-repeat-count']);
    } else {
        encoder.setRepeat(0); //auto-loop
    }

    encoder.setDelay(arg.delay);

    encoder.start();

    encoder.setSize(data.size[0], data.size[1]);

    var startTime = new Date();
    var currentTime, prevTime;
    var status = {
        processed: 0,
    };
    currentTime = startTime;
    encoder.addFrame(data.frames[0].data, true);

    // if encoding takes more than 4 seconds, send progress messages to main
    if ((new Date() - currentTime) * data.frames.length > 4000) {
        self.postMessage(JSON.stringify({
            startTime
        }));
        for (var i = 1; i < data.frames.length; i++) {
            encoder.addFrame(data.frames[i].data, true);
            status.processed = i;
            status.currentTime = new Date();
            self.postMessage(JSON.stringify(status));
        }
    } else { // else just encode
        for (var i = 1; i < data.frames.length; i++) {
            encoder.addFrame(data.frames[i].data, true);
        }
    }


    encoder.finish();
    self.postMessage("data:image/gif;base64," + encode64(encoder.stream().getData()));

}, false);
