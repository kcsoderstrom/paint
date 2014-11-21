var SlothCanvas = function(canvasEl) {
  this.ctx = canvasEl.getContext("2d");
  this.selected_sloth = null;
  this.last_pos = Array(2);
  this.savedScaleFactor = 1;
  this.tempScaleFactor = 1;
  this.savedAngle = 0;
  this.tempAngle = 0;
  this.undoStates = new Array();
  this.redoStates = new Array();
};

SlothCanvas.prototype.rotateCtx = function(obj) {
  var ctx = obj.canv.getContext("2d");

  var angleOfOriginalClick = angleWithRespectTo(obj.lastClick, obj.center);
  var angleOfThisClick = angleWithRespectTo(obj.thisClick, obj.center);

  var x = obj.canv.width / 2;
  var y = obj.canv.height / 2;

  ctx.translate( x, y );
  this.tempAngle = angleOfThisClick - angleOfOriginalClick + this.savedAngle;
  ctx.rotate( this.tempAngle);
  ctx.translate( -x, -y);
};

var angleWithRespectTo = function(pointA, pointB) {
  if(pointA[0] < pointB[0]) {
    return Math.atan((pointA[1] - pointB[1])/(pointA[0] - pointB[0])) + Math.PI;
  } else {
    return Math.atan((pointA[1] - pointB[1])/(pointA[0] - pointB[0]));
  }
};

SlothCanvas.prototype.draw = function(event) {
  if(this.redoStates.length) {
    this.redoStates = new Array();
  }

  var $canv = $("#drawing-canvas");

  var x = event.pageX - $canv.offset().left - document.getElementById("full_prep_box").width/2;
  var y = event.pageY - $canv.offset().top - document.getElementById("full_prep_box").height/2;

  if(event.type === "mousemove") {
    this.inBetween(x, y);
  }
  this.ctx.drawImage(document.getElementById("full_prep_box"), x, y);
  this.last_pos = [x,y];

  this.drawing = true;
}

SlothCanvas.prototype.x = function () {
  return this.last_pos[0];
};

SlothCanvas.prototype.y = function () {
  return this.last_pos[1];
};


// This is the most complicated and hardest to clarify
// of any of the functions here.
// It smooths out the drawing by filling in gaps
// between stamps linearly.
SlothCanvas.prototype.inBetween = function (x, y) {
  var dx = x - this.x();
  var dy = y - this.y();

  var x_sign = (dx === 0 ? 0 : dx/Math.abs(dx));
  var y_sign = (dy === 0 ? 0 : dy/Math.abs(dy));

  var times = Math.max(Math.abs(dx), Math.abs(dy));

  var the_biggah = ( times === Math.abs(dx) ? "x" : "y" );
  var the_smallah = ( times === Math.abs(dx) ? "y" : "x" );
  var notTimes = Math.min(Math.abs(dx), Math.abs(dy));  // It doesn't help that the names aren't great.
  var slope = (times / (notTimes === 0 ? 1 : notTimes ));

  var current_x = this.x();
  var current_y = this.y();

  var secret_x = this.x();
  var secret_y = this.y();

  for(var i = 0; i < times; i += 1) {
    if(the_smallah === "x") {
      secret_x += x_sign/slope;
      current_x = Math.floor(secret_x);
      current_y += y_sign;
    } else {
      secret_y += y_sign/slope;
      current_y = Math.floor(secret_y);
      current_x += x_sign;
    }

    this.ctx.drawImage(document.getElementById("full_prep_box"), current_x, current_y);
  }
};

SlothCanvas.prototype.drawInBox = function (boxId, newImg) {
  var box = document.getElementById(boxId);
  var ctx = box.getContext("2d");
  var width = box.width;
  var height = box.height;
  ctx.clearRect(0,0,width,height);
  ctx.drawImage(newImg, width/2 - newImg.width/2, height/2 - newImg.height / 2);
};

var distance = function(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

SlothCanvas.prototype.setTempScaleFactor = function (pos, center) {
  var startDist = distance(this.prepPos, center);
  var newDist = distance(pos, center);
  this.tempScaleFactor = startDist === 0 ? 1 : newDist / startDist * this.savedScaleFactor;
};

SlothCanvas.prototype.start = function() {
  var mouse_is_down = false;
  var mouse_down_on_resize_button = false;
  var inMemCanvas = document.createElement('canvas');
  var inMemCtx = inMemCanvas.getContext("2d");
  var that = this;
  var brush = document.createElement('canvas');
  // No need to clear the brush as it will be resized each time.

  var prepareImage = function(event){

    if(mouse_is_down && that.prepPos) {

      if($(event.currentTarget).attr("id") === "prep_box") {
        var center = [51, 51];
      } else {
        var center = [window.innerWidth/2, 350];
      }

      var thisPos = [event.pageX, event.pageY];
      that.setTempScaleFactor(thisPos, center);

      var full_original = new Image();
      full_original.src = origImgs[ $(that.selected_sloth).attr("id")[7] ].src;

      var newWidth = that.iconSize * that.tempScaleFactor;
      var oldWidth = full_original.width;
      var scaleBy = newWidth / oldWidth;
      var newHeight = full_original.height * newWidth / full_original.width;
      full_original.onload = function() {
        brush.width = newWidth;
        brush.height = newHeight;
        var bctx = brush.getContext("2d");

        var rotationParams = { canv: brush,
                               lastClick: that.prepPos,
                               thisClick: thisPos,
                               center: center };
        that.rotateCtx(rotationParams);

        bctx.scale(scaleBy, scaleBy);
        bctx.drawImage(full_original,0,0);

        that.drawInBox("prep_box", brush);
        that.drawInBox("full_prep_box", brush);
      }
    }
  };

  $("#prep_box").on("dblclick", function(event) {
    $(".prep-modal").addClass("active");
    $(".wax-paper").addClass("shady");
  });

  $(".wax-paper").on("click", function(event){
    $(".prep-modal").removeClass("active");
    $(".wax-paper").removeClass("shady");
  })

  $(window).on("mousedown", function(event){
    if($(event.target).attr("id") === "prep_box" || $(event.target).attr("id") === "full_prep_box") {
      that.prepPos = [event.pageX, event.pageY];
    }

    if($(event.target).attr("id") === "resize-canvas") {
      mouse_down_on_resize_button = true;
    } else {
      mouse_is_down = true;
    }
  });

  $(window).on("mousemove", prepareImage);

  $(window).on("mouseup", function(event){
    // Store only up to 20 for memory's sake.
    // Only store if you're drawing.
    if(that.drawing) {
      var drawingCanvas = document.getElementById("drawing-canvas");
      var newSavedState = document.createElement("canvas");
      newSavedState.width = drawingCanvas.width;
      newSavedState.height = drawingCanvas.height;
      newSavedState.getContext("2d").drawImage(drawingCanvas, 0, 0);
      that.undoStates.push(newSavedState);

      if ( that.undoStates.length > 20 ) {
        that.undoStates.shift();
      }
    }

    mouse_down_on_resize_button = false;
    mouse_is_down = false;
    that.prepPos = null;
    that.savedScaleFactor = that.tempScaleFactor;
    that.savedAngle = that.tempAngle;
    that.drawing = false;
  });

  $(window).on("mousemove", function(event){
    if(mouse_is_down && !that.prepPos && that.drawing) {
      if(that.selected_sloth) {
        that.draw(event);
      }
    } else if(mouse_down_on_resize_button) {
      var canv = document.getElementById("drawing-canvas");
      var $canv = $(canv);
      var ctx = canv.getContext("2d");
      inMemCanvas.width = canv.width;
      inMemCanvas.height = canv.height;
      inMemCtx = inMemCanvas.getContext("2d");
      inMemCtx.drawImage(canv, 0, 0);
      document.getElementById("drawing-canvas").width = event.pageX - $canv.offset().left;
      document.getElementById("drawing-canvas").height = event.pageY - $canv.offset().top;
      ctx.drawImage(inMemCanvas, 0, 0);
    }

    $(".line.vertical").css("top", $("main").offset().top);
    $(".line.vertical").css("left", Math.max( event.pageX, 20 ));
    $(".line.horizontal").css("top", Math.max( event.pageY, $("main").offset().top + 20 ));
  });

  $(window).on("keydown", function(event) {

    if((event.keyCode === 90) && (event.ctrlKey) && (that.undoStates.length > 1)) {
      // undo when they press ctrl+z
      var drawingCanvas = document.getElementById("drawing-canvas");
      that.redoStates.unshift(that.undoStates.pop());
      var returnToState = that.undoStates[that.undoStates.length - 1];
      drawingCanvas.width = returnToState.width;
      drawingCanvas.height = returnToState.height;
      drawingCanvas.getContext("2d").drawImage(returnToState, 0, 0);
    } else if((event.keyCode === 89) && (event.ctrlKey) && (that.redoStates.length > 0)) {

      //redo on ctrl + y
      var drawingCanvas = document.getElementById("drawing-canvas");
      var returnToState = that.redoStates[0];
      drawingCanvas.width = returnToState.width;
      drawingCanvas.height = returnToState.height;
      drawingCanvas.getContext("2d").drawImage(returnToState, 0, 0);
      that.undoStates.push(that.redoStates.shift());
    }
  })


  $("#drawing-canvas").on("mousedown", function(event){
    if(that.selected_sloth) {
      that.draw(event);
    }
  });

  $("canvas").on("click", function(event) {
    if($(event.currentTarget).attr("id") === "drawing-canvas") {
      return;
    }

    if($(event.currentTarget).hasClass("icon")) {
      that.selected_sloth = event.currentTarget;

      var prepCtx = document.getElementById("prep_box").getContext("2d");
      var fullCtx = document.getElementById("full_prep_box").getContext("2d");
      prepCtx.clearRect(0,0,100,100);
      fullCtx.clearRect(0,0,500,500);
      prepCtx.drawImage(that.selected_sloth, 35 - $(that.selected_sloth).width() / 2, 35 - $(that.selected_sloth).height() / 2);
      fullCtx.drawImage(that.selected_sloth, 250 - $(that.selected_sloth).width() / 2, 250 - $(that.selected_sloth).height() / 2);
      that.iconSize = 50; // The standard width of an icon
      that.angle = 0;
    }

  });

  $("button.clear").on("click", function(event){
    event.preventDefault();
    var drawingCanvas = document.getElementById("drawing-canvas");
    drawingCanvas.getContext("2d").clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  });

  $("a.save").on("click", function(event){
    event.preventDefault();
    var dataURL = document.getElementById("drawing-canvas").toDataURL('image/png').replace("image/png", "image/octet-stream");
    window.location.href = dataURL;
  });
};
