import { GraphQLServer } from 'graphql-yoga';
import { Prisma } from '../prisma/prisma';
// import { User } from '../generated/prisma';
// import { prisma } from './generated/prisma';
import { permissions } from './permissions'; 
import { createTextChangeRange } from 'typescript';
import { getUserIdFromRequest, getAuthToken } from './permissions/my-utils';

const resolvers = {
  Query: {
    user: (_, {id}, ctx: {prisma: Prisma}) => {
      // const { prisma } = context;
      console.log('1')
      // console.log('2',   prisma)
      return ctx.prisma.query.user({ where: {id} });
    },
    users: (_, __, ctx: {prisma: Prisma}, ____) => {
      return ctx.prisma.query.users({})
    }
  },
  // User: {
  //   tags: async (user: User, args, ctx: { prisma: Prisma}) => {
  //     const userWithTags = await ctx.prisma.query.user({
  //       where: {
  //         id: user.id
  //       }
  //     })
  //     return userWithTags
  //   }
  // },
  Mutation: {
      createUser(parent, {username, email, uid}, ctx, info) {
        console.log(username, 'SADSASDAS')
        return ctx.prisma.mutation.createUser({"data": { username, email, uid}})
      },
      // login: async (_, args: { email, password }, ctx: { prisma: Prisma}) => {
      //   const { uid } = getUidForValidCredentials({ email, password });
      //   // need to call firebase and grab private identifier 
      //   if (uid) {
      //     const user = await ctx.prisma.query.user({where: { uid }});
      //     return {
      //       error: null,
      //       token: getAuthToken(user)
      //     }
      //   }
      // }
    // signup: (_, args, context, info) => {
      
    // }
  }
}

const server = new GraphQLServer({
  typeDefs: 'yoga-server/src/schema.graphql',
  resolvers,
  context: async req => {
    const userId = getUserIdFromRequest(req);
    let user;
    const prisma = new Prisma({
     endpoint: 'http://localhost:4467',
    })
    if (userId) {
      user = await prisma.query.user({ where: { id: userId }});
    }
    return {
      user,
      ...req,
      prisma
  };
  }
})
server.start(() => console.log(`GraphQL server is running on http://localhost:4000`))