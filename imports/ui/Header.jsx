import React, { Component, PropTypes } from 'react';

require('../static/css/base.css');

export default class Header extends Component {

  render() {
    return (
      <nav>
        <ul>
          <li class="nav__playlist">
            <a href="">New Playlist</a>
          </li>
          <li class="nav__home">
            <a href="">Home</a>
          </li>        
        </ul>
      </nav>
    );
  }
}