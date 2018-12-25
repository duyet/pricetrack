/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function Main() {
  $(function() {
    this.$signInButton = $('#nav-login-btn');
    this.$signOutButton = $('#nav-signout-btn');
    this.$signedInButton = $('#nav-signed-btn');

    this.$signedUsername = $('#signed-username');

    this.$urlList = $('#listUrls');
    

    this.$messageTextarea = $('#demo-message');
    this.$createMessageButton = $('#demo-create-message');
    this.$createMessageResult = $('#demo-create-message-result');
    this.$messageListButtons = $('.message-list-button');
    this.$messageList = $('#demo-message-list');
    this.$messageDetails = $('#demo-message-details');

    this.$signInButton.on('click', this.signIn.bind(this));
    this.$signOutButton.on('click', this.signOut.bind(this));
    this.$createMessageButton.on('click', this.createMessage.bind(this));
    this.$messageListButtons.on('click', this.listMessages.bind(this));
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
  }.bind(this));
}

Main.prototype.signIn = function() {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

Main.prototype.signOut = function() {
  firebase.auth().signOut();
};

Main.prototype.onAuthStateChanged = function(user) {
  if (user) {
    console.log(user)
    this.$signInButton.hide()
    this.$signedInButton.show()
    this.$signedUsername.html(user.displayName)
    this.loadListUrl()
  } else {
    this.$signInButton.show()
    this.$signedInButton.hide()
    this.$urlList.html('Please login.');
  }
};

Main.prototype.createMessage = function() {
  var message = this.$messageTextarea.val();

  if (message === '') return;

  // Make an authenticated POST request to create a new message
  this.authenticatedRequest('POST', '/api/messages', {message: message}).then(function(response) {
    this.$messageTextarea.val('');
    this.$messageTextarea.parent().removeClass('is-dirty');

    this.$createMessageResult.html('Created <b>' + response.category + '</b> message: ' + response.message);
  }.bind(this)).catch(function(error) {
    console.log('Error creating message:', message);
    throw error;
  });
};

Main.prototype.loadListUrl = function() {
  this.$urlList.html('');
  var url = '/api/listUrls';
  this.$urlList.append($('<h6 class="border-bottom border-gray pb-2 mb-0">Loading ...</h6>'));
  
  this.authenticatedRequest('GET', url).then(function(response) {
    var elements = response.map(function(message) {
      return $(`<div class="media text-muted pt-3">
                  <svg class="bd-placeholder-img mr-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: 32x32"><title>Placeholder</title><rect fill="${message.color}" width="100%" height="100%"/><text fill="${message.color}" dy=".3em" x="50%" y="50%">32x32</text></svg>
                  <p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                    <strong class="d-block text-gray-dark">${message.domain}</strong>
                    <a href="${message.url}" target="_blank">${message.url.length > 100 ? message.url.slice(0, 100) + '...' : message.url}</a>
                    <br /><br />
                    <small>
                    <a href="${message.helpers.price_series}" target="_blank">Price Series</a> | 
                    <a href="${message.helpers.raw}" target="_blank">Raw data</a> | 
                    <a href="${message.helpers.pull}" target="_blank">Pull data</a> | 
                    Last pull: ${moment(message.last_pull_at).fromNow()}</small>
                  </p>
                </div>`)
        .on('click', this.messageDetails.bind(this));
    }.bind(this));

    // Append items to the list and simulate a click to fetch the first message's details
    this.$urlList.html('').append($('<h6 class="border-bottom border-gray pb-2 mb-0">Recent updates</h6>'));
    this.$urlList.append(elements);
    this.$urlList.append($(`        <small class="d-block text-right mt-3">
          <a href="#">All updates</a>
        </small>`));

    if (elements.length > 0) {
      elements[0].click();
    } else {
      this.$urlList.html('Nothing')
    }
  }.bind(this)).catch(function(error) {
    console.log('Error listing messages.');
    throw error;
  });
};

Main.prototype.listMessages = function(event) {
  this.$messageListButtons.removeClass('mdl-button--accent');
  $(event.target).parent().addClass('mdl-button--accent');
  this.$messageList.html('');
  this.$messageDetails.html('');

  // Make an authenticated GET request for a list of messages
  // Optionally specifying a category (positive, negative, neutral)
  var label = $(event.target).parent().text().toLowerCase();
  var category = label === 'all' ? '' : label;
  var url = category ? '/api/messages?category=' + category : '/api/messages';
  this.authenticatedRequest('GET', url).then(function(response) {
    var elements = response.map(function(message) {
      return $('<li>')
        .text(message.message)
        .addClass('mdl-list__item')
        .data('key', message.key)
        .on('click', this.messageDetails.bind(this));
    }.bind(this));

    // Append items to the list and simulate a click to fetch the first message's details
    this.$messageList.append(elements);

    if (elements.length > 0) {
      elements[0].click();
    }
  }.bind(this)).catch(function(error) {
    console.log('Error listing messages.');
    throw error;
  });
};

Main.prototype.messageDetails = function(event) {
  $('li').removeClass('selected');
  $(event.target).addClass('selected');

  var key = $(event.target).data('key');
  this.authenticatedRequest('GET', '/api/message/' + key).then(function(response) {
    this.$messageDetails.text(JSON.stringify(response, null, 2));
  }.bind(this)).catch(function(error) {
    console.log('Error getting message details.');
    throw error;
  });
};

Main.prototype.authenticatedRequest = function(method, url, body) {
  if (!firebase.auth().currentUser) {
    throw new Error('Not authenticated. Make sure you\'re signed in!');
  }

  // Get the Firebase auth token to authenticate the request
  return firebase.auth().currentUser.getIdToken().then(function(token) {
    var request = {
      method: method,
      url: url,
      dataType: 'json',
      beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + token); }
    };

    if (method === 'POST') {
      request.contentType = 'application/json';
      request.data = JSON.stringify(body);
    }

    console.log('Making authenticated request:', method, url);
    return $.ajax(request).catch(function() {
      throw new Error('Request error: ' + method + ' ' + url);
    });
  });
};

window.demo = new Main();