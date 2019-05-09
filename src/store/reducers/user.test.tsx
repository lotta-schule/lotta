import { userReducer } from './user';
import { UserActionType } from '../actions/user';

describe('user reducer', () => {

    it('should handle LOGIN', () => {
        expect(
            userReducer({ user: null, token: null }, {
                type: UserActionType.LOGIN,
                user: {
                    id: 'U001',
                    email: 'user001@medienportal.org',
                    name: 'User001'
                },
                token: '00000000'
            })
        ).toEqual({
            user: {
                id: 'U001',
                email: 'user001@medienportal.org',
                name: 'User001'
            },
            token: '00000000'
        });
    });

    it('should handle LOGOUT', () => {
        expect(
            userReducer(
                {
                    user: {
                        id: 'U001',
                        email: 'user001@medienportal.org',
                        name: 'User001'
                    },
                    token: '00000000'
                },
                {
                    type: UserActionType.LOGOUT
                }
            )
        ).toEqual({
            user: null,
            token: null
        });
    });
});