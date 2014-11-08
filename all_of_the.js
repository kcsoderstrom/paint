var SlothCanvas = function(canvasEl) {
  this.ctx = canvasEl.getContext("2d");
  this.selected_sloth = null;
};

SlothCanvas.prototype.start = function() {
  var mouse_is_down = false;
  var ctx = this.ctx;
  var that = this;
  $(window).on("mousedown", function(event){
    mouse_is_down = true;
  });

  $(window).on("mouseup", function(event){
    mouse_is_down = false;
  });

  $("#drawing-canvas").on("mousemove", function(event){
    if(mouse_is_down) {
      if(that.selected_sloth) {
        var x = event.pageX - 10 - $(that.selected_sloth).width()/2;
        var y = event.pageY - 110 - $(that.selected_sloth).height()/2;
        ctx.drawImage(that.selected_sloth, x, y);
      }
    }
  });

  $("canvas").on("click", function(event) {
    if($(event.currentTarget).attr("id") === "drawing-canvas") {
      return;
    }

    that.selected_sloth = event.currentTarget;
  });


};
