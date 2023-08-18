import * as React from 'react';
import { motion } from 'framer-motion';

export interface CollapseProps {
  visible: boolean;
  children: React.ReactNode;
}

export const Collapse = ({ visible, children }: CollapseProps) => {
  const variants = {
    visible: {
      height: 'auto',
      opacity: 1,
    },
    hidden: {
      height: 0,
      opacity: 0,
    },
  };
  const state = visible ? 'visible' : 'hidden';
  return (
    <motion.div
      aria-hidden={!visible}
      style={{ overflow: 'hidden' }}
      initial={state}
      animate={state}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
