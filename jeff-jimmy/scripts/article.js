'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// DONE** COMMENT: Why isn't this method written as an arrow function?
// Since we are using contextual 'this' for this method to refer to this instance of Article, we cannot use arrow functions as they do not pass in contextual 'this'.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE** COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // We used an if else before. A ternary is going on below. publishStatus is checking the truthy-ness of publishedOn. If it's truthy, then store the first value. If not, then '(draft)' is stored into the property.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// DONE** COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// It is called in Article.fetchAll. rawData represents our local data that's been stored from 'server data' (hackerIpsum.json).
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)));
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  $.ajax({
    url: 'data/hackerIpsum.json',
    method: 'HEAD',
    success: (data, message, xhr) => {
      loadData(xhr.getAllResponseHeaders().split('"')[1]);
    }
  });
}

// helper function that compares the eTags. If the eTag is not the same, it will save and load from the server, otherwise it loads locally.
function loadData(eTag){
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.eTag === eTag) { // if there is nothing in local storage, it will not load rawData
    Article.loadAll(JSON.parse(localStorage.rawData));
    articleView.initIndexPage();
  } else {
    $.ajax({
      url: 'data/hackerIpsum.json',
      method: 'GET',
      success: (data) => {
        let rawData = JSON.stringify(data);
        localStorage.setItem('rawData', rawData);
        localStorage.setItem('eTag', eTag);
        Article.loadAll(data);
        articleView.initIndexPage();
      }
    });
  }
}
