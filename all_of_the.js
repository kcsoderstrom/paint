var SlothCanvas = function(canvasEl) {
  this.ctx = canvasEl.getContext("2d");
  this.selected_sloth_src = null;
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
      var x = event.pageX - 10;
      var y = event.pageY - 110;
      console.log(x);

      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(x,y,10,10);
    }
  });

  $("img#01").on("click", function() {
    that.selected_sloth_src = getElementById("01");
  });


};
