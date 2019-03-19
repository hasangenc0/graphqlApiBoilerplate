import { expect } from 'chai';
import * as Api from '../api/api';

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when user can be found', async () => {
      const expectedResult = {
        data: {
          user: {
            id: '1',
            username: 'hasan',
            email: 'hasangencx@hotmail.com',
            role: 'ADMIN',
          },
        },
      };

      const result = await Api.user({ id: '1' });

      expect(result.data).to.eql(expectedResult);
    });
  });
});