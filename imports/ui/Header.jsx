import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import PlaylistForm from './PlaylistForm.jsx';

require('../static/css/base.css');
require('../static/css/header.css');

export default class Header extends Component {
  constructor() {
    super();

    // showForm initialized to '' to prevent value from being passed to 
    // PlaylistForm.componentWillReceiveProps() on the initial render.
    this.state = ({
      showForm: '',
    });

    this.showPlaylistForm = this.showPlaylistForm.bind(this);
    this.changeShowValue = this.changeShowValue.bind(this);
  }

  // used when PlaylistForm is closed from its own view.
  changeShowValue(val) {
    this.setState({
      showForm: false
    });
  }

  showPlaylistForm(evt) {
    if (evt) {
      evt.preventDefault();
    }

    if (this.state.showForm === '') {
      this.setState({ showForm: true });
    } else {
      this.setState({
        showForm: !this.state.showForm
      });
    }

  }

  render() {
    return (
      <div>
        <nav>
          <ul>
            <li onClick={this.showPlaylistForm} className="nav__playlist">
              <a href="">New Playlist</a>
            </li>
          </ul>
        </nav>

        <PlaylistForm ref="plistForm" changeShowValue={this.changeShowValue} showForm={this.state.showForm} />

      </div>
    );
  }
}