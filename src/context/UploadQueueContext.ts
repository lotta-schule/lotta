/**
 * @author Alexis Rinaldoni <alexis.rinaldoni@be-terna.com>
 */

import React from 'react';
import noop from 'lodash/noop';
import { UploadQueueService } from '../api/UploadQueueService';

export const UploadQueueContext = React.createContext<UploadQueueService>(new UploadQueueService(noop, noop));
