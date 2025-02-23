import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faBold,
  faDownLeftAndUpRightToCenter,
  faItalic,
  faList,
  faListOl,
  faUnderline,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonGroup, Toolbar } from '@lotta-schule/hubert';
import { useFocused } from 'slate-react';
import { motion } from 'framer-motion';
import { EditToolbarMarkButton } from './EditToolbarMarkButton';
import { EditToolbarLinkButton } from './EditToolbarLinkButton';
import { EditToolbarBlockButton } from './EditToolbarBlockButton';
import { EditToolbarImageButton } from './EditToolbarImageButton';

import styles from './EditToolbar.module.scss';
import navbarStyles from '../../../layout/navigation/Navbar.module.scss';

export const EditToolbar = React.memo(() => {
  const isFocused = useFocused();

  const animate = isFocused ? 'visible' : 'hidden';

  const [navbarHeight, setNavbarHeight] = React.useState(104);
  React.useEffect(() => {
    const navbarEl = document.getElementsByClassName(navbarStyles.root)?.[0];
    if (navbarEl) {
      setNavbarHeight(navbarEl.clientHeight);
    }
  }, []);

  const top = navbarHeight;

  const variants = {
    visible: {
      opacity: 1,
      scaleY: 1,
      y: 0,
      top,
    },
    hidden: {
      opacity: 0,
      scaleY: 0,
      y: -50,
      top,
    },
  };

  return (
    <motion.div
      className={styles.root}
      variants={variants}
      initial={'hidden'}
      animate={animate}
    >
      <Toolbar className={styles.toolbar}>
        <ButtonGroup className={styles.toolbarButtonGroup}>
          <EditToolbarMarkButton mark={'bold'}>
            <Icon icon={faBold} size={'lg'} />
          </EditToolbarMarkButton>
          <EditToolbarMarkButton mark={'italic'}>
            <Icon icon={faItalic} size={'lg'} />
          </EditToolbarMarkButton>
          <EditToolbarMarkButton mark={'underline'}>
            <Icon icon={faUnderline} size={'lg'} />
          </EditToolbarMarkButton>
        </ButtonGroup>
        &nbsp;
        <ButtonGroup className={styles.toolbarButtonGroup}>
          <EditToolbarLinkButton />
        </ButtonGroup>
        &nbsp;
        <ButtonGroup className={styles.toolbarButtonGroup}>
          <EditToolbarBlockButton mark={'unordered-list'}>
            <Icon icon={faList} size={'lg'} />
          </EditToolbarBlockButton>
          <EditToolbarBlockButton mark={'ordered-list'}>
            <Icon icon={faListOl} size={'lg'} />
          </EditToolbarBlockButton>
        </ButtonGroup>
        &nbsp;
        <ButtonGroup className={styles.toolbarButtonGroup}>
          <EditToolbarImageButton />
        </ButtonGroup>
        &nbsp;
        <ButtonGroup className={styles.toolbarButtonGroup}>
          <EditToolbarMarkButton mark={'small'}>
            <Icon icon={faDownLeftAndUpRightToCenter} />
          </EditToolbarMarkButton>
        </ButtonGroup>
        &nbsp;
      </Toolbar>
    </motion.div>
  );
});
EditToolbar.displayName = 'textContentModuleEditToolbar';
