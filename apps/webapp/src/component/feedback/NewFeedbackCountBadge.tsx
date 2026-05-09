'use client';

import * as React from 'react';
import { Badge } from '@lotta-schule/hubert';
import { useNewFeedbackCount } from '#/util/feedback/index.js';

export const NewFeedbackCountBadge = () => {
  const newFeedbackBadgeNumber = useNewFeedbackCount();

  return <Badge value={newFeedbackBadgeNumber} />;
};
