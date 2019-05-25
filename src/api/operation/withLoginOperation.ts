import { graphql } from 'react-apollo';
import { LoginMutation } from 'api/mutation/LoginMutation';
import { UserModel } from 'model';

export const withLoginOperation = graphql<{ token: string, user: UserModel }, {}, { username: string, password: string }>(LoginMutation);
