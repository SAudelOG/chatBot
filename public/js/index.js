// var chat
var $chatWindow = $(".chatbot-window");
var $qInput = $("#user-input-q");
var $qClear = $("#clear-q");

var BotWindow = function($chatWindow, $qInput, $qClear) {
  var self = this;
  self.$chatWindow = $chatWindow;
  self.$qInput = $qInput;
  self.$qClear = $qClear;
  self.API_END_POINT = 'http://192.168.100.74:3000';


  // Method to send message to the API
  self.sendMessage = function (queryMessage, cb) {
    $.ajax(self.API_END_POINT, {
      cache: false,
      dataType: 'json',
      data: {
          q : queryMessage
      },
      error: function(e) {
        debugger;
        console.log(e);
        cb(e);
      },
      success: function(response) {
        debugger;
        cb(undefined, response);
      },
    });
  }

  self.renderMessage = function(type, msg) {
    console.log('you need to render this message');
    console.log(msg);
  };

  // Initialize Listeners

  self.$qInput.on('click', function(e) {
    // console.log('click');
  });

  self.$qInput.keydown(function (e) {
    var $el = $(this);
    var msg = $el.val();
    // Get tne enter key press
    if(e.keyCode == 13) {
      // clear Input
      $el.val('');
      // send message to the UI
      self.renderMessage('user', $el.val());
      // render the response
      self.sendMessage(msg, function(err, response) {
        if (err) throw new Error(err);
        // Send response message to the UI
        self.renderMessage('bot', response.chat);
      });
    }
  });

  return self;
}

// Initialize botWindow
var botWindow = new BotWindow($chatWindow, $qInput, $qClear);
