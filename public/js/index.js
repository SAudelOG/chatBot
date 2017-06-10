// var chat
var $qInput = $("#user-input-q");
var $qClear = $("#clear-q");
// var $;

function sendMessage(queryMessage) {
  $.ajax('http://192.168.100.74:3000', {
    cache: false,
    dataType: 'json',
    data: {
        q : queryMessage
    },
    error: function() {
      console.log('error retrieving data');
    },
    success: function(response) {
      return response
    },
    timeout: 5000
  });
}
console.log(sendMessage('hola!'));
// Initialize liseners
