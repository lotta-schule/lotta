import * as React from 'react';
import { ArticleModel } from 'model';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';

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
                    <FormControlLabel
                        value={ArticleState.Draft}
                        aria-label={'draft'}
                        control={<Radio />}
                        label={'Entwurf'}
                        disabled={state !== ArticleState.Published && isAdmin}
                    />
                    <FormControlLabel
                        value={ArticleState.Submitted}
                        aria-label={'submitted'}
                        control={<Radio />}
                        label={'Zur Kontroller freigeben'}
                        disabled={
                            (!isAdmin && state === ArticleState.Published) ||
                            (!isAuthor && isAdmin)
                        }
                    />
                    <FormControlLabel
                        value={ArticleState.Published}
                        aria-label={'published'}
                        control={<Radio />}
                        label={'freigegeben und veröffentlicht'}
                        disabled={!isAdmin}
                    />
                </RadioGroup>
            </div>
        );
    }
);
