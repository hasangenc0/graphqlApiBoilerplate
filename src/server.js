import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import express from 'express';

import { ApolloServer, AuthenticationError} from 'apollo-server-express';

import schema from './graphql/schema';
import resolvers from './graphql/resolvers';
import models, { sequelize } from './models';

const app = express();

app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
      };
    }
    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET,
      };
    }
  }
});

server.applyMiddleware({ app, path: '/graphql'});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);


const PORT = process.env.PORT || 5000;

const isTest = process.env.TEST;

sequelize.sync({ force: isTest }).then(async () => {
  if (isTest) {
    createUsersWithMessages(new Date());
  }

  httpServer.listen({ port: PORT, hostname: '127.0.0.1' }, () =>
    console.log(`🚀 Server ready at http://127.0.0.1:${PORT}${server.graphqlPath}`)
  );

});

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      username: 'hasan',
      email: 'hasangencx@hotmail.com',
      password: 'admin*123',
      role: 'ADMIN',
      messages: [
        {
          text: 'Some Message',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    },
  );

  await models.User.create(
    {
      username: 'user',
      email: 'user@example.com',
      password: 'user*123',
      messages: [
        {
          text: 'Message 1...',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          text: 'Message 2 ...',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    },
  );
};


const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};
