import gql from 'graphql-tag';

export const CreateWidgetMutation = gql`
    mutation CreateWidget($title: String, $type: WidgetType) {
        widget: createWidget(title: $title, type: $type) {
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