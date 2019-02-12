import 'dotenv/config';
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
  context: async ({req}) => {
    const me = await getMe(req);
    return {
      models,
      me,
      secret: process.env.SECRET,
    };
  }
});

server.applyMiddleware({ app, path: '/graphql'});

const PORT = process.env.PORT || 5000;

const eraseDatabaseOnSync = true; // TODO: Remove in production

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages(new Date());
  }

  app.listen({ port: PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  );

});

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      username: 'admin',
      email: 'admin@hotmail.com',
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
