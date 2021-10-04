import * as React from 'react';
import { DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { chunk } from 'lodash';
import { Button } from 'component/general/button/Button';
import { Checkbox } from 'component/general/form/checkbox';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { LOCALSTORAGE_KEY } from './Schedule';

import styles from './SelectCoursesDialog.module.scss';

const COLUMNS_COUNT = 2;

export interface SelectCoursesDialogProps {
    isOpen: boolean;
    possibleCourses: string[];
    onClose(): void;
}

export const SelectCoursesDialog = React.memo<SelectCoursesDialogProps>(
    ({ isOpen, possibleCourses, onClose }) => {
        const [selectedCourses, setSelectedCourses] =
            React.useState<string[]>(possibleCourses);

        React.useEffect(() => {
            try {
                const persistedCourseList =
                    localStorage.getItem(LOCALSTORAGE_KEY);
                if (persistedCourseList) {
                    setSelectedCourses(JSON.parse(persistedCourseList));
                }
            } catch {}
        }, []);

        const isSelected = (courseName: string) =>
            selectedCourses.indexOf(courseName) > -1;

        const toggle = (courseName: string) => {
            if (isSelected(courseName)) {
                setSelectedCourses(
                    selectedCourses.filter((c) => c !== courseName)
                );
            } else {
                setSelectedCourses([...selectedCourses, courseName]);
            }
        };

        const saveAndClose = () => {
            try {
                localStorage.setItem(
                    LOCALSTORAGE_KEY,
                    JSON.stringify(selectedCourses)
                );
            } catch (e) {
                console.error(e);
            }
            onClose();
        };

        return (
            <ResponsiveFullScreenDialog open={isOpen} fullWidth>
                <DialogTitle>Kurse filtern</DialogTitle>
                <DialogContent>
                    <div className={styles.courseNamesListsWrapper}>
                        {chunk(
                            possibleCourses,
                            Math.ceil(possibleCourses.length / COLUMNS_COUNT)
                        ).map((courses, i) =>
                            courses.map((courseName) => (
                                <Checkbox
                                    key={`${i}-courseName`}
                                    label={courseName}
                                    value={courseName}
                                    checked={isSelected(courseName)}
                                    onChange={() => toggle(courseName)}
                                />
                            ))
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose()}>Abbrechen</Button>
                    <Button type={'submit'} onClick={() => saveAndClose()}>
                        Filter speichern
                    </Button>
                </DialogActions>
            </ResponsiveFullScreenDialog>
        );
    }
);
SelectCoursesDialog.displayName = 'SelectCoursesDialog';
