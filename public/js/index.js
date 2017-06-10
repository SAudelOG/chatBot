var $chatWindow = $(".chatbot-window");

var BotWindow = function($chatWindow) {
  var self = this;
  self.$chatWindow = $chatWindow;
  self.$qInput = self.$chatWindow.find('#user-input-q');
  self.$qClear = self.$chatWindow.find('#clear-q');
  self.$conversationBubble = self.$chatWindow.find(".conversation-body");
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
        cb(e);
      },
      success: function(response) {
        cb(undefined, response);
      },
    });
  }

  self.renderMessage = function(type, msg) {
    self.$conversationBubble.append('<div class="conversation-bubble '+ type +'-bubble"><p>'+ msg +'</p></div>');
    // Go to the latest message
    self.$conversationBubble.scrollTop(self.$conversationBubble.prop("scrollHeight"));
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
      self.renderMessage('user', msg);
      // render the response
      // TODO: add class to show a response wating class
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
var botWindow = new BotWindow($chatWindow);
