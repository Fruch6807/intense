/**
 * Applies rotation according to current iteration, total number of frames
 * and desired angle
 * @param {number}                   iteration Current iteration
 * @param {number}                   frameNum  Total number of frames
 * @param {number}                   angle     Rotation angle (radians)
 * @param {CanvasRenderingContext2D} ctx
 */
function rotate(iteration, frameNum, angle, ctx, canvas) {
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(iteration / frameNum * angle);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

/**
 * INTENSE
 * @param {number}   jiggle [[Description]]
 * @param {CanvasRenderingContext2D} ctx    [[Description]]
 */
function intense(jiggle, ctx) {
  ctx.translate((Math.random() * 2 - 1) * jiggle, (Math.random() * 2 - 1) * jiggle);
}


function zoom(value, ctx, canvas) {
  //TODO: translate to a different position
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(value, value);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

/**
 * Function which applies all of the transformaition according to arg
 * @param {Object} arg
 * @param {number} iteration OPTIONAL
 */
function draw(arg, iteration, context, canvas, imageObj) {
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
    zoom(arg.zoom.value, context, canvas);
  }
  if (arg.rotate) {
    rotate(iteration, arg.frames, Math.PI * 2, context, canvas);
  }
  context.drawImage(imageObj, 0, 0);


  if (arg.color) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = arg.color.rgba;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }
  context.restore();
}

export default draw;