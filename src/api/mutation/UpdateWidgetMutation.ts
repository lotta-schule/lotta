import gql from 'graphql-tag';

export const UpdateWidgetMutation = gql`
    mutation UpdateWidget($id: ID!, $widget: WidgetInput) {
        widget: updateWidget(id: $id, widget: $widget) {
            id
            title
            type
            configuration
            iconImageFile {
                    id
                    remoteLocation
                }
            groups {
                id
                sortKey
                name
            }
        }
    }
`;