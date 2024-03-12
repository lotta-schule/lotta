import * as React from 'react';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faShare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@lotta-schule/hubert';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { FeedbackModel } from 'model';
import { Icon } from 'shared/Icon';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { DeleteFeedbackDialog } from './DeleteFeedbackDialog';
import { ForwardFeedbackDialog } from './ForwardFeedbackDialog';
import { RespondToFeedbackDialog } from './RespondToFeedbackDialog';
import { de } from 'date-fns/locale';
import clsx from 'clsx';

import styles from '../Feedback.module.scss';

export type FeedbackRowProps = {
  feedback: FeedbackModel;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
};

export const FeedbackRow = React.memo(
  ({ feedback, isActive, onClick, onDelete }: FeedbackRowProps) => {
    const [isForwardFeedbackDialogOpen, setIsForwardFeedbackDialogOpen] =
      React.useState(false);
    const [isRespondToFeedbackDialogOpen, setIsRespondToFeedbackDialogOpen] =
      React.useState(false);
    const [isDeleteFeedbackDialogOpen, setIsDeleteFeedbackDialogOpen] =
      React.useState(false);
    return (
      <React.Fragment key={feedback.id}>
        <tr
          className={clsx(styles.title, {
            [styles.active]: isActive,
          })}
          onClick={onClick}
        >
          <td>{feedback.user && <UserAvatar user={feedback.user} />}</td>
          <td>{feedback.user?.name}</td>
          <td>{feedback.topic}</td>
          <td>
            {format(new Date(feedback.insertedAt), 'Pp', {
              locale: de,
            })}
          </td>
          <td>
            <Button
              small
              icon={<Icon icon={faTrash} />}
              title={'Feedback löschen'}
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteFeedbackDialogOpen(true);
              }}
            />
          </td>
        </tr>
        {isActive && (
          <motion.tr
            initial={{ opacity: 0, y: -50, height: 0 }}
            exit={{ opacity: 0, y: -50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            className={styles.info}
          >
            <td colSpan={4}>
              <h6>Nachricht:</h6>
              <div className={styles.messageSection}>
                <p className={styles.message}>{feedback.content}</p>
                <div className={styles.buttons}>
                  <Button
                    variant={'fill'}
                    aria-label="Feedback weiterleiten"
                    icon={<Icon icon={faShare} size="xl" />}
                    disabled={feedback.isForwarded}
                    onClick={() => setIsForwardFeedbackDialogOpen(true)}
                  >
                    weiterleiten
                  </Button>
                  <Button
                    icon={<Icon icon={faCommentDots} size="xl" />}
                    aria-label="Feedback beantworten"
                    className={styles.answerButton}
                    disabled={feedback.isResponded}
                    onClick={() => setIsRespondToFeedbackDialogOpen(true)}
                  >
                    beantworten
                  </Button>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
        <ForwardFeedbackDialog
          feedback={feedback}
          isOpen={isForwardFeedbackDialogOpen}
          onRequestClose={() => setIsForwardFeedbackDialogOpen(false)}
        />
        <RespondToFeedbackDialog
          feedback={feedback}
          isOpen={isRespondToFeedbackDialogOpen}
          onRequestClose={() => setIsRespondToFeedbackDialogOpen(false)}
        />
        <DeleteFeedbackDialog
          feedback={feedback}
          isOpen={isDeleteFeedbackDialogOpen}
          onRequestClose={() => setIsDeleteFeedbackDialogOpen(false)}
          onConfirm={() => {
            setIsDeleteFeedbackDialogOpen(false);
            onDelete();
          }}
        />
      </React.Fragment>
    );
  }
);
FeedbackRow.displayName = 'FeedbackRow';
