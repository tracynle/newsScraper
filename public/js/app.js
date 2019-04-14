// App.js will be used to append your data onto your page by using ajax calls
// ============
// use JSON to get your articles and append into the p tag with the `data`
$.getJSON("/articles", function(data){
    // use a for loop to get each article
    for(var i = 0; i < data.length; i++) {
        // display the article's id, title and link on the page
        $("#articles").append("<p data-id= '" + data[i]._id + "' >" + data[i].title + "<br /><a href='" + data[i].link + "'>" + data[i].link + "</a></p>");
    }
})
// When someone clicks on the p tag, the document will be ready when someone clicks on it. 
// (Use the on click method)
$(document).on("click", "p", function(){
    // you want to empty the notes from the note section so older notes wouldn't be shown
    $("#notes").empty();
    // save `thisId` to `this` attr to the data-id from the p tag 
    var thisId = $(this).attr("data-id");
    // make an ajax call for the articles with the get method and at the url route and the thisId
    $.ajax ({
        method: GET,
        url: "/articles/" + thisId
        // return a promise with a function that has `data` as a callback
    })
    .then(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button type='button' class='btn btn-primary' data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
});

// ==============

// When you click the savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  