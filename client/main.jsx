import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
import PlaylistForm from '../imports/ui/PlaylistForm.jsx';

Meteor.startup(() => {
  render(<App />, document.getElementById('music-player'));
  render(<PlaylistForm />, document.getElementById('playlist-form'));
});