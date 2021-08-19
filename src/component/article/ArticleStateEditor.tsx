import * as React from 'react';
import { ArticleModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { RadioGroup, Radio } from 'component/general/form/radio';

export interface ArticleStateEditorProps {
    article: ArticleModel;
    onUpdate: (article: ArticleModel) => void;
}

enum ArticleState {
    Draft = 'DRAFT',
    Submitted = 'SUBMITTED',
    Published = 'PUBLISHED',
}

export const ArticleStateEditor = React.memo<ArticleStateEditorProps>(
    ({ article, onUpdate }) => {
        const currentUser = useCurrentUser();
        const isAdmin = User.isAdmin(currentUser);
        const isAuthor = User.isAuthor(currentUser, article);
        const state = React.useMemo(() => {
            if (article.published) {
                return ArticleState.Published;
            }
            if (article.readyToPublish) {
                return ArticleState.Submitted;
            }
            return ArticleState.Draft;
        }, [article.readyToPublish, article.published]);

        return (
            <div data-testid={'ArticleStateEditor'}>
                <RadioGroup
                    aria-label={'publish state'}
                    name={'article-publish-state'}
                    value={state}
                    onChange={({ currentTarget }) => {
                        const state = currentTarget.value as ArticleState;
                        onUpdate({
                            ...article,
                            readyToPublish: state === ArticleState.Submitted,
                            published: state === ArticleState.Published,
                        });
                    }}
                >
                    <Radio
                        value={ArticleState.Draft}
                        aria-label={'draft'}
                        label={'Entwurf'}
                        featureColor={[125, 125, 125]}
                        disabled={
                            state !== ArticleState.Published &&
                            isAdmin &&
                            !isAuthor
                        }
                    />
                    <Radio
                        value={ArticleState.Submitted}
                        aria-label={'submitted'}
                        label={'Zur Kontrolle freigeben'}
                        featureColor={[200, 200, 50]}
                        disabled={state === ArticleState.Published || isAdmin}
                    />
                    <Radio
                        value={ArticleState.Published}
                        aria-label={'published'}
                        label={'freigegeben und veröffentlicht'}
                        featureColor={[50, 225, 50]}
                        disabled={!isAdmin}
                    />
                </RadioGroup>
            </div>
        );
    }
);
