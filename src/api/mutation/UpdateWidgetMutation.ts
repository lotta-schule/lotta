import gql from 'graphql-tag';

export const UpdateWidgetMutation = gql`
    mutation UpdateWidget($id: ID!, $widget: WidgetInput) {
        widget: updateWidget(id: $id, widget: $widget) {
            id
            title
            type
            group {
                id
                priority
                name
            }
            configuration
        }
    }
`;