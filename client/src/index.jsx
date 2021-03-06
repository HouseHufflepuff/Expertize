import React from 'react';
import { render } from 'react-dom';
import ApolloClient from 'apollo-boost';
import { Router } from 'react-router-dom';
import history from './app/history.js';
import App from './app/App.jsx';

const client = new ApolloClient({
  uri: "http://localhost:4000"
});

render(<Router history={history}><App client={client} /></Router>, document.getElementById('app'));
