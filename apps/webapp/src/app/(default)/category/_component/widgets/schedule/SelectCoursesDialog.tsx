import * as React from 'react';
import { chunk } from 'lodash';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { LOCALSTORAGE_KEY } from './Schedule';

import styles from './SelectCoursesDialog.module.scss';

const COLUMNS_COUNT = 2;

export interface SelectCoursesDialogProps {
  isOpen: boolean;
  possibleCourses: string[];
  onRequestClose(): void;
}

export const SelectCoursesDialog = React.memo<SelectCoursesDialogProps>(
  ({ isOpen, possibleCourses, onRequestClose }) => {
    const [selectedCourses, setSelectedCourses] =
      React.useState<string[]>(possibleCourses);

    React.useEffect(() => {
      try {
        const persistedCourseList = localStorage.getItem(LOCALSTORAGE_KEY);
        if (persistedCourseList) {
          setSelectedCourses(JSON.parse(persistedCourseList));
        }
      } catch {
        console.error('Could not load selected courses from local storage');
      }
    }, []);

    const isSelected = (courseName: string) =>
      selectedCourses.indexOf(courseName) > -1;

    const toggle = (courseName: string) => {
      if (isSelected(courseName)) {
        setSelectedCourses(selectedCourses.filter((c) => c !== courseName));
      } else {
        setSelectedCourses([...selectedCourses, courseName]);
      }
    };

    const saveAndClose = () => {
      try {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(selectedCourses));
      } catch (e) {
        console.error(e);
      }
      onRequestClose();
    };

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onRequestClose}
        title={'Kurse filtern'}
      >
        <DialogContent>
          <div className={styles.courseNamesListsWrapper}>
            {chunk(
              possibleCourses,
              Math.ceil(possibleCourses.length / COLUMNS_COUNT)
            ).map((courses, i) =>
              courses.map((courseName) => (
                <Checkbox
                  key={`${i}-courseName`}
                  value={courseName}
                  isSelected={isSelected(courseName)}
                  onChange={() => toggle(courseName)}
                >
                  {courseName}
                </Checkbox>
              ))
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onRequestClose()}>Abbrechen</Button>
          <Button type={'submit'} onClick={() => saveAndClose()}>
            Filter speichern
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
SelectCoursesDialog.displayName = 'SelectCoursesDialog';
