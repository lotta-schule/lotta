import { gql } from '@apollo/client';

export const GetFileDetailsQuery = gql`
    query GetFileDetailsQuery($id: ID) {
        file(id: $id) {
            id
            insertedAt
            updatedAt
            filename
            filesize
            remoteLocation
            mimeType
            fileType
            user {
                id
                name
                nickname
                avatarImageFile {
                    remoteLocation
                }
            }
            usage {
                ... on FileCategoryUsageLocation {
                    usage
                    category {
                        id
                        title
                    }
                }
                ... on FileArticleUsageLocation {
                    usage
                    article {
                        id
                        title
                        previewImageFile {
                            remoteLocation
                        }
                    }
                }
                ... on FileContentModuleUsageLocation {
                    usage
                    article {
                        id
                        title
                        previewImageFile {
                            remoteLocation
                        }
                    }
                }
                ... on FileSystemUsageLocation {
                    usage
                }
                ... on FileUserUsageLocation {
                    usage
                    user {
                        id
                        name
                        nickname
                        avatarImageFile {
                            remoteLocation
                        }
                    }
                }
            }
            fileConversions {
                id
                insertedAt
                updatedAt
                format
                mimeType
                remoteLocation
            }
            parentDirectory {
                id
            }
        }
    }
`;
