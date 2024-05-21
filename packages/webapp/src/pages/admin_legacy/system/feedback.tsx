import * as React from 'react';
import { Icon } from 'shared/Icon';
import { AdminPage } from 'administration/AdminPage';
import { Feedback } from 'administration/system/Feedback';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

const FeedbackRoute = () => {
  return (
    <AdminPage
      title={
        <>
          <Icon icon={faCommentDots} /> Feedback
        </>
      }
      component={() => <Feedback />}
      hasHomeLink
    />
  );
};

export default FeedbackRoute;
