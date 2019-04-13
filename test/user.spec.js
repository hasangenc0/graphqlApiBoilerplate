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

    it('returns null when user cannot be found', async () => {
      const expectedResult = {
        data: {
          user: null,
        },
      };

      const result = await Api.user({ id: '99' });

      expect(result.data).to.eql(expectedResult);
    });

  });

  describe('deleteUser(id: String!): Boolean!', () => {
    it('returns an error because only admins can delete a user', async () => {
      /*const {
        data: {
          data: {
            signIn: { token },
          },
        },
      } = await Api.signIn({
        login: 'user',
        password: 'user*123',
      });*/

      /*const {
        data: { errors },
      } = await Api.deleteUser({ id: '1' }, token);

      expect(errors[0].message).to.eql('Not authorized as admin.');*/
    });
  });
});
