/**
 * @author Alexis Rinaldoni <alexis.rinaldoni@be-terna.com>
 */

import { createContext } from 'react';
import { UploadQueueService } from '../api/UploadQueueService';
import noop from 'lodash/noop';

export const UploadQueueContext = createContext<UploadQueueService>(new UploadQueueService(noop));
