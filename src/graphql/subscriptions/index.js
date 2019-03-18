import { PubSub } from 'apollo-server-express';
import * as MESSAGE_EVENTS from '../resolvers/message';

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
};

export default new PubSub();