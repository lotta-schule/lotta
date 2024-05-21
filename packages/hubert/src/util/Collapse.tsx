'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export interface CollapseProps {
  visible: boolean;
  axis?: 'x' | 'y';
  children: React.ReactNode;
}

export const Collapse = ({ visible, axis = 'y', children }: CollapseProps) => {
  const variants = {
    visible: {
      height: 'auto',
      width: 'auto',
      opacity: 1,
    },
    hidden: {
      height: axis !== 'x' ? 0 : 'auto',
      width: axis === 'x' ? 0 : 'auto',
      opacity: 0,
    },
  };
  const state = visible ? 'visible' : 'hidden';
  return (
    <motion.div
      aria-hidden={!visible}
      style={{ overflow: visible ? 'auto' : 'hidden' }}
      initial={state}
      animate={state}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
