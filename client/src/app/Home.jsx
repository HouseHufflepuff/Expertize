import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: false };
  }

  render() {
    return (
      <div>
        <Jumbotron>
          <h1>Welcome to Expertize!</h1>
          <p>
            Tutors exist, but young professionals are too busy. We bring
            together people of various expertise to connect them for brief,
            educational exchange. Ultimately the goal is to spread knowledge to
            every person across many subjects.
          </p>
          <p>
            <Button bsStyle="primary">Learn more</Button>
          </p>
        </Jumbotron>
        {/* Code below went here */}
      </div>
    );
  }
};