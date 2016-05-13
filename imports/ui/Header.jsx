import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import PlaylistForm from './PlaylistForm.jsx';

require('../static/css/base.css');
require('../static/css/header.css');

export default class Header extends Component {
  constructor() {
    super();

    this.state = ({
      showForm: false,
    });

    this.showPlaylistForm = this.showPlaylistForm.bind(this);
  }

  showPlaylistForm(evt) {
    evt.preventDefault();

    this.setState({ showForm: !this.state.showForm }, () => {
      let playlistForm = ReactDOM.findDOMNode(this.refs.plistForm);
      console.log("playlistForm", playlistForm);
      if (this.state.showForm) {
        playlistForm.style.display = 'block';
      } else {
        playlistForm.style.display = 'none';
      }
    });
  }

  render() {
    console.log("header render() showForm: ", this.state.showForm);
    return (
      <div>
        <nav>
          <ul>
            <li className="nav__home">
              <a href="">Home</a>
            </li>        
            <li onClick={this.showPlaylistForm} className="nav__playlist">
              <a href="">New Playlist</a>
            </li>
          </ul>
        </nav>

        <div ref="plistForm" className="playlistForm">
          <div className="plistFormCancelBtn" onClick={this.showPlaylistForm}> X </div>
          <PlaylistForm ref="plistForm" showForm={this.state.showForm} extendHeader={this} />
        </div>

      </div>
    );
  }
}