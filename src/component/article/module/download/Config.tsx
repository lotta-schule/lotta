import React, { memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { FormControl, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import get from 'lodash/get';

const useStyles = makeStyles(() => ({
    formControl: {
        width: '100%',
    },
}));

interface ConfigProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
    onRequestClose(): void;
}

export const Config = memo<ConfigProps>(({ contentModule, onUpdateModule }) => {
    const hidePreviews = get(
        contentModule.configuration,
        'hidePreviews',
        false
    );
    const styles = useStyles();

    return (
        <form data-testid="DownloadContentModuleConfiguration">
            <FormControl className={styles.formControl}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!hidePreviews}
                            onChange={(_, checked) =>
                                onUpdateModule({
                                    ...contentModule,
                                    configuration: {
                                        ...contentModule.configuration,
                                        hidePreviews: !checked,
                                    },
                                })
                            }
                            name="hidePreviews"
                        />
                    }
                    label={'Vorschaubilder anzeigen'}
                />
            </FormControl>
        </form>
    );
});
