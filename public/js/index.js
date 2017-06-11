(function() {
  var $chatWindow = $(".chatbot-window");

  var BotWindow = function($chatWindow) {
    var self = this;
    self.sessionId = undefined;
    self.$chatWindow = $chatWindow;
    self.$qInput = self.$chatWindow.find('#user-input-q');
    self.$qClear = self.$chatWindow.find('#clear-q');
    self.$conversationBubble = self.$chatWindow.find(".conversation-body");
    self.$actions = self.$chatWindow.find('.chatbot-actions ul li button');
    self.$loadingMessageBubble = $('<div class="conversation-bubble loading-bubble"><i class="fa fa-circle"></i><i class="fa fa-circle"></i><i class="fa fa-circle"></i></div>');
    self.windowHeight = $(window).height();

    // Method to send message to the API
    self.sendMessage = function (queryMessage, cb) {
      var API_END_POINT = 'https://booking-chat-bot.herokuapp.com/bot';

      $.ajax(API_END_POINT, {
        cache: false,
        dataType: 'json',
        data: {
          sessionId: self.sessionId,
          q : queryMessage
        },
        error: function(request, status, err) {
          var fakeResponse = {
            chat: "Something went wrong. Can you repeat that?"
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

    self.renderHotels = function(type, hotelAvailability) {
      var checkin = hotelAvailability.checkin;
      var hotels = hotelAvailability.hotels
      var cards = []

      $.each(hotels, function(idx, hotel) {
        var block_id = hotel.room_min_price ? hotel.room_min_price.block_id : hotel.group_rooms[0].block_id;
        var data = {
          img: hotel.photo,
          hotelName:hotel.hotel_name,
          rating: hotel.review_score,
          price: hotel.price,
          currencySymbol:'$',
          url:'https://secure.booking.com/book.html?hotel_id='+hotel.hotel_id+'&lang=en&stage=1&checkin='+checkin+'&interval=1&nr_rooms_'+ block_id +'=1'
        }
        // FIXME: this should be a template instead of just be hardcoded
        cards.push(
        '<div class="card card-color-'+ idx +'">' +
          '<div class="card-thumbnail" style="background-image: url('+ data.img +');">' +
            '<span class="hotel-name">' +
              data.hotelName +
            '</span>' +
            '<span class="hotel-rating">'+ data.rating +'/10</span>' +
          '</div>' +
          '<span class="hotel-class">' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
            '<i class="fa fa-star"></i>' +
          '</span>' +
          '<a href=' + data.url + ' class="btn-book">Book now for '+ data.currencySymbol + data.price +'</a>' +
        '</div>'
      );
      });
      var cardsString = cards.join(''); // Convert the array into a sinlge string
      var $cardContainer = $('<div class="card-container">' + cardsString +' </div>')
      self.$conversationBubble.append($cardContainer);
      $cardContainer.slick(); // Slider plugin
    };

    self.renderPlaces = function(type, places) {

      var places = places.businesses;
      var cards = []
      if (places.length) {
        $.each(places, function(idx, place) {
          var data = {
            img: place.image_url,
            name:place.name,
            rating: place.rating,
            url:place.url
          }
          // FIXME: this should be a template instead of just be hardcoded
          cards.push(
          '<div class="card card-color-'+ idx +'">' +
            '<div class="card-thumbnail" style="background-image: url('+ data.img +');">' +
              '<span class="hotel-name">' +
                data.name +
              '</span>' +
              '<span class="hotel-rating">'+ data.rating +'/5</span>' +
            '</div>' +
            '<a href=' + data.url + ' class="btn-book">Go to website</a>' +
          '</div>'
        );
        });
        var cardsString = cards.join(''); // Convert the array into a sinlge string
        var $cardContainer = $('<div class="card-container">' + cardsString +' </div>')
        self.$conversationBubble.append($cardContainer);
        $cardContainer.slick(); // Slider plugin
      } else {
        // No results found
        self.renderMessage('bot', 'no places were found there');
      }
    };

    self.renderWeather = function(type, forecast) {

      var weather = forecast;
      var cards = []

      cards.push(
        '<div class="card card-color-1">' +
          '<div class="card-thumbnail" style="background-image: url(\'https://media.giphy.com/media/26u6dryuZH98z5KuY/giphy.gif\');">' +
            '<span class="weather-description">'+weather.weather[0].main+'</span>'+
            '<span class="city-name">'+weather.name+'</span>'+
            '<span class="weather-degrees">'+weather.main.temp+' º <span class="degree-type">C</span></span>'+
          '</div>' +
          '<article class="weather-info">'+
            '<h6 class="weather-title">Weather today</h6>'+
            weather.name+' is '+weather.weather[0].description+'.'+
          '</article>'+
        '</div>'
      );


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

    self.handleInputBot = function($el) {
      var msg = $el.val();

      // clear Input
      $el.val('');
      // send message to the UI
      self.renderMessage('user', msg);
      self.showLoadingMessage();
      // render the response
      // TODO: add class to show a response wating class
      self.sendMessage(msg, function(err, response) {
        self.removeLoadingMessage();
        if (err) {
          self.renderMessage('bot', 'Something went wrong. Can you repeat that?');
          throw new Error(err);
        }
        // Send response message to the UI
        if (response.chat) {
          self.renderMessage('bot', response.chat);
        }
        // Send the hotels message to the UI
        if (response.action === 'book' && response.data) {
          self.renderHotels('bot', response.data);
        }
        if (response.action === 'weather' && response.data) {
          self.renderWeather('bot', response.data);
        }
        if ((response.action === 'food' || response.action === 'places') && response.data) {
          self.renderPlaces('bot', response.data);
        }

        self.scrollTopWindow(self.$conversationBubble);
      });
    };

    self.setBodyHeight = function() {
      $('body').height(self.windowHeight)
    }

    self.setSessionId = function() {
      var botSession = JSON.parse(window.localStorage.getItem('botsession'));
      if (!botSession) {
        var rdmSessionId = Math.floor(Math.random() * (9999999999 - 1111111 + 1)) + 1111111
        window.localStorage.setItem('botsession', JSON.stringify(rdmSessionId));
        self.sessionId = rdmSessionId;
      } else {
        self.sessionId = botSession;
      }
      console.log('your session id: ', self.sessionId);
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
        self.handleInputBot($el);
      }
    });

    self.$actions.on('click', function(e){
      var $el = $(this);
      var actionCliked = $el.attr('id');

      var bookMsg = 'I want to get a room';
      var visitMsg = 'place to visit';
      var eatMsg = 'show me restaurants';
      var weatherMsg = 'how\'s the weather';

      switch (actionCliked) {
        case 'book':
          self.$qInput.val(bookMsg);
          break;
        case 'visit':
          self.$qInput.val(visitMsg);
          break;
        case 'eat':
          self.$qInput.val(eatMsg);
          break;
        case 'weather':
          self.$qInput.val(weatherMsg);
          break;
      }
      self.handleInputBot(self.$qInput);
    });

    // Initialize bot
    self.setSessionId();
    self.setBodyHeight();

    // Return constructor
    return self;
  }

  // Initialize botWindow
  var botWindow = new BotWindow($chatWindow);
  window.botWindow = botWindow; // Debug
})();
