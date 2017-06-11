(function() {
  var $chatWindow = $(".chatbot-window");

  var BotWindow = function($chatWindow) {
    var self = this;
    self.$chatWindow = $chatWindow;
    self.$qInput = self.$chatWindow.find('#user-input-q');
    self.$qClear = self.$chatWindow.find('#clear-q');
    self.$conversationBubble = self.$chatWindow.find(".conversation-body");
    self.$loadingMessageBubble = $('<div class="conversation-bubble loading-bubble"><i class="fa fa-circle"></i><i class="fa fa-circle"></i><i class="fa fa-circle"></i></div>');

    // Method to send message to the API
    self.sendMessage = function (queryMessage, cb) {
      var API_END_POINT = 'http://test.pedropablo.xyz/';

      $.ajax(API_END_POINT, {
        cache: false,
        dataType: 'json',
        data: {
          q : queryMessage
        },
        error: function(request, status, err) {
          var fakeResponse = {
            chat: "this is a fake response just for testing"
          }
          if (status == "timeout") {
            // send fake data
            cb(undefined, fakeResponse);
          } else {
            cb(status);
          }
        },
        success: function(response) {
          cb(undefined, response);
        },
        timeout: 5000,
      });
    }

    self.renderMessage = function(type, msg) {
      self.$conversationBubble.append('<div class="conversation-bubble '+ type +'-bubble"><p>'+ msg +'</p></div>');

      if (type === 'user') {
        self.scrollTopWindow(self.$conversationBubble);
      }
    };

    self.renderHotels = function(type, hotels) {
      var checkin = hotels.checkin;
      hotels = hotels.hotels; // Hack: while we get the real data from the hotels
      var cards = [];
      $.each(hotels, function(idx, hotel) {
        var interval =
        var fakeData = {
          img: hotel.photo,
          hotelName:hotel.hotel_name ,
          rating: hotel.review_score,
          price: hotel.price,
          currencySymbol:'$'
          url:'https://secure.booking.com/book.html?hotel_id='+hotel.hotel_id+'&lang=en&stage=1&checkin='+checkin+'&interval=1&nr_rooms_'+hotel.room_min_price.block_id+'=1'
        }
        // FIXME: this should be a template instead of just be hardcoded
        cards.push(
        '<div class="card">' +
          '<figure class="card-thumbnail">' +
            '<img src="'+ fakeData.img +'" alt="hotel img">' +
            '<figcaption class="hotel-name">' +
              fakeData.hotelName +
            '</figcaption>' +
            '<span class="hotel-rating">'+ fakeData.rating +'</span>' +
          '</figure>' +
          '<span class="hotel-class">' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
          '</span>' +
          '<button type="button" name="book" class="btn-book">Book now for '+ fakeData.currencySymbol + fakeData.price +'</button>' +
        '</div>'
      );
      });
      var cardsString = cards.join(''); // Convert the array into a sinlge string
      var $cardContainer = $('<div class="card-container">' + cardsString +' </div>')
      self.$conversationBubble.append($cardContainer);
      $cardContainer.slick(); // Slider plugin
    };

    self.scrollTopWindow = function($bubble) {
      // Go to the latest message
      $bubble.scrollTop($bubble.prop("scrollHeight"));
    };

    self.showLoadingMessage = function() {
      self.$conversationBubble.append(self.$loadingMessageBubble);
      self.scrollTopWindow(self.$conversationBubble);
    }

    self.removeLoadingMessage = function() {
      self.$loadingMessageBubble.remove();
    }

    // Initialize Listeners
    self.$qClear.on('click', function(e) {
      // Clear input
      self.$qInput.val('');
    });

    self.$qInput.keydown(function (e) {
      var $el = $(this);
      var msg = $el.val();
      // Get tne enter key press
      if(msg !== '' && e.keyCode == 13) {
        // clear Input
        $el.val('');
        // send message to the UI
        self.renderMessage('user', msg);
        self.showLoadingMessage();
        // render the response
        // TODO: add class to show a response wating class
        self.sendMessage(msg, function(err, response) {
          self.removeLoadingMessage();
          if (err) throw new Error(err);
          // Send response message to the UI
          self.renderMessage('bot', response.chat);
          // Send the hotels message to the UI
          // self.renderHotels('bot', response.hotels); // remove this comment and uncomment the sentence
            if (response.hotelAvailability.hotels && response.hotelAvailability.hotels.length) {
              self.renderHotels('bot', response.hotelAvailability);
            }

          self.scrollTopWindow(self.$conversationBubble);
        });
      }
    });

    return self;
  }

  // Initialize botWindow
  var botWindow = new BotWindow($chatWindow);
})();
