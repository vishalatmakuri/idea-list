var Comment = require('../models/comments');
var Idea = require('../models/ideas');
var User = require('../models/users');
var Vote = require('../models/votes');
var IFuncs = require('./idea-functions');
//var slackPost = require('./slackPost');
var request = require('request');

function slackInt (req, res){
  // TODO: slash command to return a list of all active ideas with their info
  
  // Parsing incoming request data
  // For ideas: parsed = [ title | text | tags ];
  // For comments: parsed = [ shortId | text ];
  var parsed = req.body.text.split("|").map(function(y){ return y.trim(); });
  
  // helper functions for querying data with async callbacks for userId and parentId
  function setUserId (un, callback){ 
    User.findOne({ sUserName: un }, function (err, user) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, user._id);
      }
    });
  }
  
  function setParentId (pi, callback) {
    Idea.find({ shortId: pi }, function(err, idea){
      if(err) {
        callback(err, null);
      } else {
        callback(null, idea[0]._id);
      }
    });
  }

  // Set slackId to the user_id
  req.body.slackId = req.body.user_id;

  // Parsing data and directing idea / comment / vote to db insert functions
  switch(req.body.command){
    case '/idea':
      // TODO: create hyperlink for unique id
      req.body.shortId = parsed[0].split(" ").join("_")+"_"+req.body.user_name;
      req.body.title = parsed[0];
      req.body.body = parsed[1];
      if (parsed.length === 3) {
        req.body.tags = parsed[2].split(' ');
      }
      setUserId(req.body.user_name, function(err, uId) {
        if (err) console.log(err);
        req.body.userId = uId;    
        IFuncs.createIdea(req, res);
      });
      break;
    case '/comment':
      // TODO: create hyperlink for comment id 
      req.body.shortId = parsed[0];
      req.body.body = parsed[1];
      req.body.parentType = 'idea';

      // search in the db for the shortId, if it does not exist, send error msg back to user
      setParentId (req.body.shortId, function(err, pId) {
        if (err) { 
          console.log(err);
          reply = 'Idea not found. See a list of active ideas with /ideaList'; 
          res.end(reply);
        } else {
          req.body.parentId = pId;
          IFuncs.createComment(req, res);
        }
      });
      break;
    case '/upvote':
      // call upvote function
      break;
    case '/downvote':
      // call downvote function
      break;
    default:
      res.send("Invalid slash command entered: " + req.body.command);
  }
} // end slackInt


// expose functions
module.exports = { slackInt: slackInt };