import * as React from 'react';
import { IFrameWidgetConfig } from 'model';
import { Input, Label } from '@lotta-schule/hubert';

import styles from './WidgetConfiguration.module.scss';

export interface IFrameWidgetConfigurationProps {
    configuration: IFrameWidgetConfig;
    setConfiguration(configuration: IFrameWidgetConfig): void;
}

export const IFrameWidgetConfiguration =
    React.memo<IFrameWidgetConfigurationProps>(
        ({ configuration, setConfiguration }) => {
            return (
                <div data-testid={'IFrameWidgetConfiguration'}>
                    <Label label={'URL'}>
                        <Input
                            className={styles.input}
                            value={configuration.url}
                            onChange={(e) =>
                                setConfiguration({
                                    ...configuration,
                                    url: e.currentTarget.value,
                                })
                            }
                        />
                        <p>
                            Die URL die im iframe angezeigt werden soll. Dabei
                            ist zu beachten, dass Internetseiten es auch
                            verbieten oder beschränken können, in einem iframe
                            angezeigt zu werden. Weitere Informationen dazu gibt
                            es bei{' '}
                            <a
                                href={
                                    'https://developer.mozilla.org/de/docs/Web/HTTP/Headers/X-Frame-Options'
                                }
                                rel={'noreferrer'}
                                target={'_blank'}
                            >
                                MDN Web Docs (X-Frame Options)
                            </a>
                        </p>
                    </Label>
                </div>
            );
        }
    );
IFrameWidgetConfiguration.displayName = 'IFrameWidgetConfiguration';
