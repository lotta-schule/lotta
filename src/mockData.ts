import { State } from "./store/State";
import { ContentModuleType, UserModel, UserGroup } from "./model";

export const mockData: State = {
    user: {
        user: null,
        token: null
    },
    client: {
        client: {
            id: 'C001',
            slug: 'einsa',
            title: 'Medienportal'
        }
    },
    content: {
        categories: [
            {
                id: 'C0001',
                title: 'Profil'
            },
            {
                id: 'C0002',
                title: 'GTA'
            },
            {
                id: 'C0003',
                title: 'Projekte'
            },
            {
                id: 'C0004',
                title: 'Fächer'
            },
            {
                id: 'C0005',
                title: 'Material'
            },
            {
                id: 'C0006',
                title: 'Galerien'
            },
            // Fächer >
            {
                id: 'C0007',
                title: 'Sport',
                categoryId: 'C0004'
            },
            {
                id: 'C0008',
                title: 'Kunst',
                categoryId: 'C0004'
            },
            {
                id: 'C0009',
                title: 'Sprache',
                categoryId: 'C0004'
            },
            // > Profil
            {
                id: 'C0010',
                title: 'Podcast',
                categoryId: 'C0002'
            },
            {
                id: 'C0010',
                title: 'Offene Kunst-AG',
                categoryId: 'C0002'
            },
            {
                id: 'C0011',
                title: 'Schülerzeitung',
                categoryId: 'C0002'
            },
            {
                id: 'C0012',
                title: 'Oskar-Reime-Chor',
                categoryId: 'C0002'
            },
            {
                id: 'C0013',
                title: 'Schüler-Radio',
                categoryId: 'C0002'
            },
        ],
        articles: [
            {
                id: 'A01',
                createdAt: new Date(2019, 5, 18, 14, 12, 24),
                updatedAt: new Date(2019, 5, 18, 14, 12, 24),
                title: 'And the oskar goes to ...',
                preview: 'Hallo hallo hallo',
                previewImage: 'https://placeimg.com/640/480/animals',
                category: {
                    id: 'C0001',
                    title: 'Profil'
                },
                modules: [
                    {
                        id: 'M01',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    },
                    {
                        id: 'M02',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    }
                ]
            },
            {
                id: 'A02',
                createdAt: new Date(2018, 4, 7, 12, 15, 45),
                updatedAt: new Date(2018, 4, 7, 12, 15, 45),
                title: 'Landesfinale Volleyball WK IV',
                preview: 'Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale "Jugend trainiert für Europa" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...',
                previewImage: 'https://placeimg.com/640/480/architecture',
                category: {
                    id: 'C0001',
                    title: 'Profil'
                },
                modules: [
                    {
                        id: 'M01',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    },
                    {
                        id: 'M02',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    }
                ]
            },
            {
                id: 'A03',
                createdAt: new Date(2019, 4, 3, 7, 56, 1),
                updatedAt: new Date(2019, 4, 3, 7, 56, 1),
                title: 'Der Podcast zum WB 2',
                preview: 'Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.',
                category: {
                    id: 'C0001',
                    title: 'Profil'
                },
                pageName: 'KleinKunst 2018',
                previewImage: 'https://placeimg.com/640/480/people',
                modules: [
                    {
                        id: 'M01',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    },
                    {
                        id: 'M02',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    }
                ]
            },
            {
                id: 'A04',
                createdAt: new Date(2019, 5, 8, 23, 18, 47),
                updatedAt: new Date(2019, 5, 8, 23, 18, 47),
                title: 'Der Vorausscheid',
                preview: 'Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.',
                category: {
                    id: 'C0001',
                    title: 'Profil'
                },
                pageName: 'KleinKunst 2018',
                previewImage: 'https://placeimg.com/640/480/tech',
                modules: [
                    {
                        id: 'M01',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    },
                    {
                        id: 'M02',
                        text: 'JTdCJTIyb2JqZWN0JTIyJTNBJTIydmFsdWUlMjIlMkMlMjJkb2N1bWVudCUyMiUzQSU3QiUyMm9iamVjdCUyMiUzQSUyMmRvY3VtZW50JTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIyYmxvY2slMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMm5vZGVzJTIyJTNBJTVCJTdCJTIyb2JqZWN0JTIyJTNBJTIydGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0JTJDJTIwY29uc2V0ZXR1ciUyMHNhZGlwc2NpbmclMjBlbGl0ciUyQyUyMHNlZCUyMGRpYW0lMjBub251bXklMjBlaXJtb2QlMjB0ZW1wb3IlMjBpbnZpZHVudCUyMHV0JTIwbGFib3JlJTIwZXQlMjBkb2xvcmUlMjBtYWduYSUyMGFsaXF1eWFtJTIwZXJhdCUyQyUyMHNlZCUyMGRpYW0lMjB2b2x1cHR1YS4lMjBBdCUyMHZlcm8lMjBlb3MlMjBldCUyMGFjY3VzYW0lMjBldCUyMGp1c3RvJTIwZHVvJTIwZG9sb3JlcyUyMGV0JTIwZWElMjByZWJ1bS4lMjBTdGV0JTIwY2xpdGElMjBrYXNkJTIwZ3ViZXJncmVuJTJDJTIwbm8lMjBzZWElMjB0YWtpbWF0YSUyMHNhbmN0dXMlMjBlc3QlMjBMb3JlbSUyMGlwc3VtJTIwZG9sb3IlMjBzaXQlMjBhbWV0LiUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQlMkMlMjBjb25zZXRldHVyJTIwc2FkaXBzY2luZyUyMGVsaXRyJTJDJTIwc2VkJTIwZGlhbSUyMG5vbnVteSUyMGVpcm1vZCUyMHRlbXBvciUyMGludmlkdW50JTIwdXQlMjBsYWJvcmUlMjBldCUyMGRvbG9yZSUyMG1hZ25hJTIwYWxpcXV5YW0lMjBlcmF0JTJDJTIwc2VkJTIwZGlhbSUyMHZvbHVwdHVhLiUyMEF0JTIwdmVybyUyMGVvcyUyMGV0JTIwYWNjdXNhbSUyMGV0JTIwanVzdG8lMjBkdW8lMjBkb2xvcmVzJTIwZXQlMjBlYSUyMHJlYnVtLiUyMFN0ZXQlMjBjbGl0YSUyMGthc2QlMjBndWJlcmdyZW4lMkMlMjBubyUyMHNlYSUyMHRha2ltYXRhJTIwc2FuY3R1cyUyMGVzdCUyMExvcmVtJTIwaXBzdW0lMjBkb2xvciUyMHNpdCUyMGFtZXQuJTIyJTJDJTIybWFya3MlMjIlM0ElNUIlNUQlN0QlNUQlN0QlNUQlN0QlN0Q=',
                        type: ContentModuleType.Text
                    }
                ]
            },
        ]
    },
    userFiles: {
        files: null,
        uploads: []
    }
};

type MockedUserModel = UserModel & { password: string };

export const mockUsers: MockedUserModel[] = [
    {
        id: 'U001',
        email: 'alexis@einsa.net',
        name: 'Alexis Rinaldoni',
        avatar: 'https://avatars.dicebear.com/v2/avataaars/alexisrinaldoni.svg',
        group: UserGroup.STUDENT,
        password: 'mp3'
    },
    {
        id: 'U002',
        email: 'billy@einsa.net',
        name: 'Christopher Bill',
        avatar: 'https://avatars.dicebear.com/v2/avataaars/billy.svg',
        group: UserGroup.STUDENT,
        password: 'test'
    },
    {
        id: 'U003',
        email: 'eike@einsa.net',
        name: 'Eike Wiewiorra',
        avatar: 'https://avatars.dicebear.com/v2/avataaars/eikewiewiorra.svg',
        group: UserGroup.TEACHER,
        password: 'vodkacola'
    },
];