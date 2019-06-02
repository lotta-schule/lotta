import { State } from "./store/State";
import { ContentModuleType } from "./model";

export const mockData: State = {
    user: {
        user: null
    },
    client: {
        client: null,
        categories: []
    },
    content: {
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