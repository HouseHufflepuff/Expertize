import { GraphQLServer } from 'graphql-yoga';
import { Prisma, User } from '../prisma/generated';
import { createTextChangeRange } from 'typescript';
import 'dotenv/config';

const resolvers = {
  Query: {
    user: (_, {uid}, ctx: {prisma: Prisma}, info) => {
      console.log(uid, 'asd')
      return ctx.prisma.query.user({ where: {uid} }, info);
    },
    users: (_, __, ctx: {prisma: Prisma}, info) => {
      return ctx.prisma.query.users({}, info);
    },
    messagesSent: (_, { username }, ctx: {prisma: Prisma}, info) => {
      return ctx.prisma.query.messages({ 
        where: { sender: { username }, expired: false },
        orderBy: 'createdAt_DESC' }, info);
    },
    messagesReceived: (_, { username }, ctx: {prisma: Prisma}, info) => {
      return ctx.prisma.query.messages({ 
        where: { recipient: { username }, expired: false },
        orderBy: 'createdAt_DESC' }, info);
    },
    questions: (_, __, ctx, info) => {
      return ctx.prisma.query.questions({where: {answeredBy: null}}, info);
    },
    questionsByUser: (_, {username}, ctx: {prisma: Prisma}, info) => {
      return ctx.prisma.query.questions({ where: { user: {username} }}, info);
    },
    questionsByFilter: (_, { online, offline, sort, username, audio, video, text, tag}, ctx: {prisma: Prisma}, info) => {
     let name = 'name'
      if (tag === 'All') name = 'name_not';
      return ctx.prisma.query.questions({ 
        where: {
          answeredBy: null,
          user: { username_not: username },
          OR: [{ user: { online: online }}, { user: { online: offline }}],
          AND: [{ OR: [{ audio }, { video }, { text }] }, { OR: [{ tag: { [name]: tag }}] }]
        },
        orderBy: sort }, info)
    },
    tags: (_, __, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.query.tags({}); 
    },
    sessions: (_, __, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.query.sessions({});
    },
    sessionsWhereUnacceptedPupil: (_, { username }, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.query.sessions({ where: { accepted: null, completed: null, pupil: { username } }}, info);
    },
    // sessionsWhereAcceptedExpert: (_, { username }, ctx: { prisma: Prisma }, info) => {
    //   return ctx.prisma.query.sessions({ where: { accepted: true, completed: null, expert: { username } }}, info);
    // },
    // sessionsWhereRejectedExpert: (_, { username }, ctx: { prisma: Prisma }, info) => {
    //   return ctx.prisma.query.sessions({ where: { accepted: false, completed: null, expert: { username } }}, info);
    // },
    sessionsForExpert:  (_, { username }, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.query.sessions({ where: { accepted_not: null , completed: null, expert: { username } }}, info);
    },
    getAllFinishedSessions: (_, { id }, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.query.sessions({ where: {OR:[{ expert: {id}}, {pupil: {id}}], completed: true}}, info);
    }
  },
  Mutation: {
    createUser: (_, { username, email, uid }, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.mutation.createUser({ data: { username, email, uid } }, info);
    },
    createMessage: (_, { title, sender, recipient, message }, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.mutation.createMessage({ data: { title, sender, recipient, message } }), info;
    },
    createQuestion: (_, { user, tag, description, coins, title, text, audio, video, duration }, ctx, info) => {
      return ctx.prisma.mutation.createQuestion({
        data: { user, tag, description, coins, title, text, audio, video, duration }
      }, info);
    },
    updateUserQuestion: (_, { description, title, text, audio, video, duration, id }, ctx: { prisma: Prisma}, info) => {
      return ctx.prisma.mutation.updateQuestion({
        data: { description, title, text, audio, video, duration },
        where: { id }
      }, info);
    },
    updateUser: (_, { email, uid, description, coins, ranking, inSession, dailyClaimed, debt, online, id, tag, username, image, linkedInProfile }, ctx: { prisma: Prisma }, info) => {
      return ctx.prisma.mutation.updateUser({
        data: { email, uid, description, coins, ranking, inSession, dailyClaimed, debt, online, tag, username, image, linkedInProfile },
        where: { id } 
      }, info);
    },
    updateManyUsers: (_, __, ctx, info) => {
      return ctx.prisma.mutation.updateManyUsers({ data: { dailyClaimed: false }})
    },
    updateManyMessages: (_, __, ctx, info) => {
      let past = new Date()
      return ctx.prisma.mutation.updateManyMessages({
        data: { expired : true },
        where: { createdAt_lte: new Date(past.setDate(past.getDate() - 14)).toISOString()}
      })
    },
    createSession: (_, { type, question, expert, pupil, duration, accepted, completed, startedAt, endedAt}, ctx, info) => {
      return ctx.prisma.mutation.createSession({
        data: { type, question, expert, pupil, duration, accepted, completed, startedAt, endedAt }
      });
    },
    updateSession: (_, { id, accepted, completed, startedAt, endedAt, type, duration}, ctx, info) => {
      return ctx.prisma.mutation.updateSession({
        data: { accepted, completed, startedAt, endedAt, type, duration},
        where: { id }
      }, info);
    },
    updateQuestion: (_, { id, answeredBy, description, coins, title, text, audio, video, duration }, ctx, info) => {
      return ctx.prisma.mutation.updateQuestion({
        data:{ answeredBy, description, coins, title, text, audio, video, duration },
        where: { id }
      },info)
    },
    deleteSession: (_, { id }, ctx, info) => {
      return ctx.prisma.mutation.deleteSession({
        where: {id}
      },info)
    }
  },
}
const prisma = new Prisma({
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  // debug: true
 })

const server = new GraphQLServer({
  typeDefs: 'yoga-server/src/schema.graphql',
  resolvers,
  context:  req => {
    return {
      ...req,
      prisma
    };
  }
});

// server.express.use(express.static(path.join(__dirname + '/../../client/dist')));
server.start(() => console.log(`GraphQL server is running on http://localhost:4000`));