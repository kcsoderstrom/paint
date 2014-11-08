var SlothCanvas = function(canvasEl) {
  this.ctx = canvasEl.getContext();
};

SlothCanvas.prototype.start = function() {
  // who the fuck knows what's happening here
  var ctx = this.ctx;
  $("#drawing-canvas").on("mousedown", function(event){
    var x = event.pageX;
    var y = event.pageY;

    console.log("the mouse is down gurl");
  })
};
