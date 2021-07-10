import { gql } from '@apollo/client';

export const GetFileDetailsQuery = gql`
    query GetFileDetailsQuery($id: ID) {
        file(id: $id) {
            id
            insertedAt
            updatedAt
            filename
            filesize
            mimeType
            fileType
            user {
                id
                name
                nickname
                avatarImageFile {
                    id
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
                            id
                        }
                    }
                }
                ... on FileContentModuleUsageLocation {
                    usage
                    article {
                        id
                        title
                        previewImageFile {
                            id
                        }
                    }
                }
                ... on FileTenantUsageLocation {
                    usage
                }
                ... on FileUserUsageLocation {
                    usage
                    user {
                        id
                        name
                        nickname
                        avatarImageFile {
                            id
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
            }
            parentDirectory {
                id
            }
        }
    }
`;
