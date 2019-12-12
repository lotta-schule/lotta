import gql from 'graphql-tag';

export const DeleteWidgetMutation = gql`
    mutation DeleteWidget($id: ID!) {
        widget: deleteWidget(id: $id) {
            id
        }
    }
`;