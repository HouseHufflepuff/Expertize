import React, { Component } from 'react';
import QuestionForm from '../feed/QuestionForm.jsx';
import QuestionFeed from '../feed/QuestionFeed.jsx';
import Discussion from '../routes/Discussion.jsx';
import SessionChoice from '../sessions/SessionChoice.jsx';
import SessionAccepted from '../sessions/SessionAccepted.jsx';
import SessionRejected from '../sessions/SessionRejected.jsx';
import DailyNotification from '../profile/DailyNotification.jsx';
import QuestionFilter from '../feed/QuestionFilter.jsx';
import Profile from '../profile/Profile.jsx';
import Inbox from '../inbox/Inbox.jsx';
import Stats from '../feed/Stats.jsx';
import { Route, Switch } from 'react-router-dom';
import { Query } from 'react-apollo';
import { GET_UNACCEPTED_SESSIONS, GET_EXPERT_SESSIONS } from '../apollo/gql.js';
import { Grid, Row, Col, Panel } from "react-bootstrap";
import Survey from '../sessions/Survey.jsx'
// import OpenSocket from 'socket.io-client';
import { isNull } from 'util';

export default class UserHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: [],
      dailyShow: true,
      status: ['online', 'offline'],
      order: 'createdAt_DESC',
      chat: ['text', 'audio', 'video'],
      tags: []
    }
    this.toggleDaily = this.toggleDaily.bind(this)
    this.handleStatusFilter = this.handleStatusFilter.bind(this)
    this.handleOrderFilter = this.handleOrderFilter.bind(this)
    this.handleTagFilter = this.handleTagFilter.bind(this)
    this.handleChatFilter = this.handleChatFilter.bind(this)
  }

  toggleDaily() {
    this.setState({ dailyShow: false })
  }

  handleStatusFilter(e) {
    this.setState({ status: e })
  }

  handleOrderFilter(e) {
    this.setState({ order: e })
  }

  handleChatFilter(e) {
    this.setState({ chat: e })
  }

  handleTagFilter() {

  }



  render() {
    const { match, user } = this.props;
    const { dailyShow, status, order, chat, tags } = this.state;
    return (
        <React.Fragment>{user && 
        <div>
          {!user.dailyClaimed && <DailyNotification toggle={this.toggleDaily} show={dailyShow} user={user} />}
          {/* this will listen for all sessions where user has asked a question and then someone choose to start a session w/ them */}
          <Query query={GET_UNACCEPTED_SESSIONS} variables={{ username: user.username }} pollInterval={50000}>
            {({ loading, error, data }) => {
              if (loading) return <div></div>
              if (error) return <div>{console.log(error)}</div>
              if (true) console.log('get_unaccepted-session fired', data.sessionsWhereUnacceptedPupil)
              if (data.sessionsWhereUnacceptedPupil.length > 0) {
                return <SessionChoice session={data.sessionsWhereUnacceptedPupil[0]} user={user} match={match} />
              } else {
                return null
              }
            }}
          </Query>
          <Query query={GET_EXPERT_SESSIONS} variables={{ username: user.username }} pollInterval={50000}>
            {({ loading, error, data }) => {
              if (loading) return <div></div>
              if (error) return <div>{console.log(error)}</div>
              if (true) console.log('get_expert-session fired', data.sessionsForExpert)
              if (data.sessionsForExpert && data.sessionsForExpert.length > 0) {
                if (data.sessionsForExpert[0].accepted === true) {
                  return <SessionAccepted session={data.sessionsForExpert[0]} user={user} match={match} />
                } else {
                  return <SessionRejected session={data.sessionsForExpert[0]} user={user} match={match} />
                }
              } else {
                return null
              }
            }}
          </Query>
          <Grid style={{ display: 'block', padding: "40px" }}>
            <Row style={{ padding: "14px" }}>
              <Col>
                <Panel>
                  <div>SOMETHINGGGG</div>
                  <div>SOMETHINGGGG</div>
                  <div>SOMETHINGGGG</div>
                  <div>SOMETHINGGGG</div>
                  <div>SOMETHINGGGG</div>
                  <div>SOMETHINGGGG</div>
                </Panel>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
              <Panel>
                <Stats match={match} user={user} />
              </Panel>
                <Panel>
                <QuestionFilter
                  handleStatus={this.handleStatusFilter}
                  handleOrder={this.handleOrderFilter}
                  handleChat={this.handleChatFilter}
                  handleTag={this.handleTagFilter}
                  status={status}
                  order={order}
                  chat={chat}
                  tags={tags} />
                </Panel>
              </Col>
              <Col md={9}>
                <Switch>
                  <Route path={`${match.url}/create`} render={(props) => <QuestionForm {...props} user={user} status={status} order={order} tags={tags} />} />
                  <Route path={`${match.url}/profile`} render={(props) => <Profile {...props} user={user} />} />
                  <Route path={`${match.url}/inbox`} render={(props) => <Inbox {...props} user={user} />} />
                  <Route path={`${match.url}/discussion`} render={({ match }) => <Discussion user={user} match={match} />} />
                  <QuestionFeed status={status} order={order} tags={tags} match={match} user={user} chat={chat} />
                </Switch>
              </Col>
            </Row>
          </Grid>
        </div>}
      </React.Fragment>
    );
  }
}

