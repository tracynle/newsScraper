// ============
// When someone clicks on the p tag, the document will be ready when someone clicks on it. 
// (Use the on click method)
$(document).on("click", "p", pTagOnClick);
// ==============
// When you click the savenote button
$(document).on("click", "#savenote", saveNoteClickCallback);
// ===============
// Buttons that clears articles and notes
$(document).on("click", "#clear-btn", clearClickCallback);
// ===============
// Scrape new articles 
$(document).on("click", "#scrape-btn", scrapeButtonClickCallback);

// App.js will be used to append your data onto your page by using ajax calls
// ============
// use JSON to get your articles and append into the p tag with the `data`

function getAllArticlesCallback(response){
    // use a for loop to get each article
    for(var i = 0; i < response.length; i++) {
        // display the article's id, title and link on the page
        var article = response[i];
        $("#articles").append("<p data-id= '" + article._id + "' >" + article.title + "<br /><a href='" + article.link + "'>" + article.link + "</a></p>");
    }
    
}
// 

function getArticles() {
    $.getJSON("/articles/", getAllArticlesCallback) // get all articles 
}


function getSingleArticleForNoteCallback(data) {
    console.log(data);
    // The title of the article
    $("#notes").append("<h2>" + data.title + "</h2>");
    // An input to enter a new title
    $("#notes").append(
      "<div class='form-group'><label for='notes-header'>Title:</label><input type='text' class='form-control' id='titleinput' name='title'></div>"
    );
    // A textarea to add a new note body
    $("#notes").append(
      "<div class='form-group'><label for='notes-section'>Notes:</label><textarea class='form-control' id='bodyinput' name='body' rows='3'></textarea></div>"
    );
    // A button to submit a new note, with the id of the article saved to it
    $("#notes").append(
      "<button type='button' class='btn btn-primary' data-id='" + data._id + "' id='savenote'>Save Note</button>"
    );

    // If there's a note in the article
    if (data.note) {
      // Place the title of the note in the title input
      $("#titleinput").val(data.note.title);
      // Place the body of the note in the body textarea
      $("#bodyinput").val(data.note.body);
    }
  }

function pTagOnClick(e) {
    // you want to empty the notes from the note section so older notes wouldn't be shown
    $("#notes").empty();
    // save `thisId` to `this` attr to the data-id from the p tag 
    var thisId = $(this).attr("data-id");
    // make an ajax call for the articles with the get method and at the url route and the thisId
    // return a promise with a function that has `data` as a callback
    var promise = $.ajax ({method: "GET", url: "/article/" + thisId});

    // Note section will be appended when p tag is clicked
    promise.then(getSingleArticleForNoteCallback);
}

function saveNoteClickCallback(e) {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Value taken from title input
    // Value taken from note textarea
    var dataMap = {title: $("#titleinput").val(), body: $("#bodyinput").val()};

    // Run a POST request to change the note, using what's entered in the inputs
    var promise = $.ajax({method: "POST", url: "/articles/" + thisId, data: dataMap});
  
    function saveNoteCallback(response) {
        // Log the response
        console.log(response);
        // Empty the notes section
        $("#notes").empty();
    }

      // With that done
    promise.then(saveNoteCallback);
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
}

function clearClickCallback(e) {
    // return a promise with a function that has `data` as a callback
    var promise = $.ajax ({method: "DELETE",url: "/articles/"});

    function articlesNotesClearedCallback(reponse){
        $("#articles").empty();
        $("#notes").empty();
        console.log("Everything is cleared");
    }

    promise.then(articlesNotesClearedCallback);
}

function scrapeButtonClickCallback(e) {
    var promise = $.ajax({method: "GET", url: "/scrape/"});

    function scrapeCallback(response){
        console.log("New articles scraped");
        getArticles();
    }

    promise.then(scrapeCallback);
}
