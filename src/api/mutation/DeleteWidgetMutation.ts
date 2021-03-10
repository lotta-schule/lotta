import { gql } from '@apollo/client';

export const DeleteWidgetMutation = gql`
    mutation DeleteWidget($id: ID!) {
        widget: deleteWidget(id: $id) {
            id
        }
    }
`;
