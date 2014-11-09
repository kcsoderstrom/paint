var SlothCanvas = function(canvasEl) {
  this.ctx = canvasEl.getContext("2d");
  this.selected_sloth = null;
  this.last_pos = Array(2);
};

SlothCanvas.prototype.draw = function(event) {
  console.log("starting at", this.last_pos);
  var x = event.pageX - 10 - $(this.selected_sloth).width()/2;
  var y = event.pageY - 110 - $(this.selected_sloth).height()/2;
  console.log("trying to end at", x, y)
  if(event.type === "mousemove") {
    this.inBetween(x, y);
  }
  this.ctx.drawImage(this.selected_sloth, x, y);
  this.last_pos = [x,y];
  console.log("ending at", this.last_pos);
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

    this.ctx.drawImage(this.selected_sloth, current_x, current_y);
  }
};

SlothCanvas.prototype.start = function() {
  var mouse_is_down = false;
  var that = this;
  var _i = 0;

  $(window).on("mousedown", function(event){
    mouse_is_down = true;
  });

  $(window).on("mouseup", function(event){
    mouse_is_down = false;
  });

  $("#drawing-canvas").on("mousemove", function(event){
    if(mouse_is_down) {
      if(that.selected_sloth) {
        that.draw(event);
      }
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

    that.selected_sloth = event.currentTarget;
  });


};
