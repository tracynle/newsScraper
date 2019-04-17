require("dotenv").config();
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Assign your port
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo db
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);
console.log("MONGODB_URI info: "+ MONGODB_URI);
// Routes

// A GET route for scraping the page
app.get("/scrape", function(req, res){
    // Grab the body of the html from the website with axios with a promise and `response` as a call back
    axios.get("https://news.artnet.com/").then(function(response){
        // Then, load that `body` into cheerio and save it to $ for a short hand selector
        var $ = cheerio.load(response.data);
        console.log("THIS IS THE RESPONSE: "+ response.data.substring(0, 50));
        // Then grab the html element where the article's tag is using the .each method 
        // that takes in function that include 2 parameters : `i` for iterate and element(refers to the current element from that iteration)
        $("article div.teaser-info > a").each(function(i, element) {
            // save it as an empty result object which you will use later to append on the page 
            var result = {};
            // add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("h2").text();
            result.link = $(this).attr("href");
            
            // check for duplicates condition:
            db.Article.find({title: result.title})

            .then(function(dbArticles){
                if (dbArticles.length === 0) {
                    console.log("No duplicate articles!");
                    createArticle();
                }
                else {
                    console.log("Duplicate articles scraped :( ");
                }         
            })
            .catch(function(err){
                console.log(err);
            });

            // Create a new Article using the `result` object you created earlier from scraping
            // Use mongoose db with collection name `Article` and create it with the result passed through
            // Saves article in db
            function createArticle () {
                db.Article.create(result)
                .then(function(dbArticle){
                    // Console.log the result
                    console.log("created: ");
                    console.log(dbArticle);
                })
                // .catch the function if an error occurred, log it
                .catch(function(err){
                    console.log(err);
                });
            }
        });
            // Send a response that prints: `Scrape Complete`
            res.send("Scrape Complete");
    });
});

// ========== //
// Route for all the articles you scraped from the db with the .GET route to `/articles`
app.get("/articles", function(req, res){
    // Grab every document in the Articles collection using .find({})
    db.Article.find({})
    // Return a promise to send a response in JSON Format with a callback, dbArticle (or anything else you want to call it)
    .then(function(dbArticles){
        res.json(dbArticles);        
    })
    // and also .catch the function err and send err response in json format
    .catch(function(err){
        res.json(err);
    })
})
// ========== //
// Route that grabs a specific Article by ID with the .get response 
app.get("/article/:id", function(req,res){
    // retrieve it from the db and collection with .findOne that includes an object map : `_id: req.params.id` 
    // the object map would the request at its params and id 
    db.Article.findOne({ _id: req.params.id })
        // .populate the `note` 
        .populate("note")
        // returns a promise with the `dbArticle` as a callback
        .then(function(dbArticle){
            // if the promise was successful, find an Article with the given id, send it back to the client with res.json (callback name)
            res.json(dbArticle);
        })
        // .catch if the error occured, send to the client
        .catch(function(err){
            res.json(err);
        });
});
// ========== //
// Route to POST the Article's associate note and saves/updates it
app.post("/articles/:id", function(req, res){
    // create a new collection titled `Note` to db and pass the req.body to the entry
    db.Note.create(req.body)
        // returns a promise with a callback name
    .then(function(dbNote){
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        var updatedArticle = db.Article.findOneAndUpdate({_id: req.params.id}, { note: dbNote._id}, { new: true});
        res.json(updatedArticle);

        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    })
    // .catch, if an error occured, send the response back to the client in JSON format
    .catch(function(err){
        res.json(err);
    });

});
// ========== //
// Route to DELETE one article by id
app.delete("/article/:id", function(req, res){
    db.Article.delete({ _id: req.params.id })
    .then(function(dbArticle){
        res.json(dbArticle)
    })
    .catch(function(err){
        res.json(err);
    });
})
// ========== //
// Route to DELETE ALL articles
app.delete("/articles", function(req, res){
    db.Article.remove()
    .then(function(){
       res.send(200);
    })
    .catch(function(err){
        res.json(err);
    }); 
})
// ========== //
// Start the server that listens to the port and log it.
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  






