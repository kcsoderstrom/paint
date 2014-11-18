var SlothCanvas = function(canvasEl) {
  this.ctx = canvasEl.getContext("2d");
  this.selected_sloth = null;
  this.last_pos = Array(2);
};

SlothCanvas.prototype.draw = function(event) {
  var x = event.pageX - 10 - document.getElementById("full_prep_box").width/2;
  var y = event.pageY - 110 - document.getElementById("full_prep_box").height/2;

  if(event.type === "mousemove") {
    this.inBetween(x, y);
  }
  this.ctx.drawImage(document.getElementById("full_prep_box"), x, y);
  this.last_pos = [x,y];
}

SlothCanvas.prototype.x = function () {
  return this.last_pos[0];
};

SlothCanvas.prototype.y = function () {
  return this.last_pos[1];
};

SlothCanvas.prototype.inBetween = function (x, y) {
  var dx = x - this.x();
  var dy = y - this.y();

  var x_sign = (dx === 0 ? 0 : dx/Math.abs(dx));
  var y_sign = (dy === 0 ? 0 : dy/Math.abs(dy));

  var times = Math.max(Math.abs(dx), Math.abs(dy));

  var the_biggah = ( times === Math.abs(dx) ? "x" : "y" ); // oder etwas
  var the_smallah = ( times === Math.abs(dx) ? "y" : "x" ); // this is stupid
  var notTimes = Math.min(Math.abs(dx), Math.abs(dy));
  var slope = (times / (notTimes === 0 ? 1 : notTimes ));

  var current_x = this.x();
  var current_y = this.y();

  var secret_x = this.x();
  var secret_y = this.y();

  for(var i = 0; i < times; i += 1) {
    if(the_smallah === "x") {
      secret_x += x_sign/slope;
      current_x = Math.floor(secret_x); // asuming non-zero; address that.
      current_y += y_sign;
    } else {
      secret_y += y_sign/slope;
      current_y = Math.floor(secret_y);
      current_x += x_sign;
    }

    this.ctx.drawImage(document.getElementById("full_prep_box"), current_x, current_y);
  }
};

SlothCanvas.prototype.start = function() {
  var mouse_is_down = false;
  var mouse_down_on_resize_button = false;
  var inMemCanvas = document.createElement('canvas');
  var inMemCtx = inMemCanvas.getContext("2d");
  var that = this;

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

  var prepareImage = function(event){
    if(mouse_is_down && that.prepPos) {
      // center is at 51, 51
      // or at window.innerWidth/2, 350

      if($(event.currentTarget).attr("id") === "prep_box") {
        var center = [51, 51];
      } else if($(event.currentTarget).attr("id") === "full_prep_box") {
        var center = [window.innerWidth/2, 350];
      }

      var thisPos = [event.pageX, event.pageY]
      var startDist = Math.sqrt(Math.pow(that.prepPos[0] - center[0], 2) + Math.pow(that.prepPos[1] - center[1], 2));
      var newDist = Math.sqrt(Math.pow(thisPos[0] - center[0], 2) + Math.pow(thisPos[1] - center[1], 2));
      var scaleFactor = startDist === 0 ? 1 : newDist / startDist;

      var banana = document.createElement('canvas');

      var full_original = new Image();
      full_original.src = origImgs[ $(that.selected_sloth).attr("id")[7] ].src;
      var newWidth = that.oldSize * scaleFactor;
      full_original.onload = function() {
        banana.width = newWidth;
        banana.height = full_original.height * newWidth / full_original.width;
        var bctx = banana.getContext("2d");


        //var dy = thisPos[1] - that.prepPos[1];
        //var dx = thisPos[0] - that.prepPos[0];


        if(that.prepPos[0] < center[0]) {
          var angleOfOriginalClick = Math.atan((that.prepPos[1] - center[1])/(that.prepPos[0] - center[0])) + Math.PI;
        } else {
          var angleOfOriginalClick = Math.atan((that.prepPos[1] - center[1])/(that.prepPos[0] - center[0]));
        }

        if(thisPos[0] < center[0]) {
          var angleOfThisClick = Math.atan((thisPos[1] - center[1])/(thisPos[0] - center[0])) + Math.PI;
        } else {
          var angleOfThisClick = Math.atan((thisPos[1] - center[1])/(thisPos[0] - center[0]));
        }


        bctx.translate( banana.width / 2, banana.height / 2);
        bctx.rotate( angleOfThisClick - angleOfOriginalClick );
        bctx.translate( -banana.width / 2, -banana.height / 2);

        bctx.scale(newWidth / full_original.width, newWidth / full_original.width);
        bctx.drawImage(full_original,0,0);

        var prepBoxCtx = event.currentTarget.getContext("2d");
        prepBoxCtx.clearRect(0,0,$(event.currentTarget).width(),$(event.currentTarget).height());

        prepBoxCtx.drawImage(banana, $(event.currentTarget).width()/2 - newWidth / 2, $(event.currentTarget).height()/2 - full_original.height * newWidth / full_original.width / 2);
        //that.ctx.drawImage(banana, 0, 0);
        //that.ctx.drawImage(full_original, 0, 0);
        //that.prepPos = thisPos;
      }
    }
  };

  $("#prep_box").on("mousemove", prepareImage.bind($("#prep_box")));
  $("#full_prep_box").on("mousemove", prepareImage.bind($("prep_box")));

  $(window).on("mouseup", function(event){
    mouse_down_on_resize_button = false;
    mouse_is_down = false;
    that.prepPos = null;
  });

  $(window).on("mousemove", function(event){
    if(mouse_is_down && !that.prepPos) {
      if(that.selected_sloth) {
        that.draw(event);
      }
    } else if(mouse_down_on_resize_button) {
      var canv = document.getElementById("drawing-canvas")
      var ctx = canv.getContext("2d");
      inMemCanvas.width = canv.width;
      inMemCanvas.height = canv.height;
      inMemCtx = inMemCanvas.getContext("2d");
      console.log(inMemCtx)
      inMemCtx.drawImage(canv, 0, 0);
      document.getElementById("drawing-canvas").width = event.pageX - 10;
      document.getElementById("drawing-canvas").height = event.pageY - 110;
      ctx.drawImage(inMemCanvas, 0, 0);
    }
  });


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
      document.getElementById("prep_box").getContext("2d").clearRect(0,0,100,100);
      document.getElementById("full_prep_box").getContext("2d").clearRect(0,0,500,500);
      document.getElementById("prep_box").getContext("2d").drawImage(that.selected_sloth, 35 - $(that.selected_sloth).width() / 2, 35 - $(that.selected_sloth).height() / 2);
      document.getElementById("full_prep_box").getContext("2d").drawImage(that.selected_sloth, 250 - $(that.selected_sloth).width() / 2, 250 - $(that.selected_sloth).height() / 2);
      that.oldSize = 50; // The standard width of an icon
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
