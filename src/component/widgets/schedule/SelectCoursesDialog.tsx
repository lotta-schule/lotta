import React, { memo, useEffect, useState } from 'react';
import { chunk } from 'lodash';
import { DialogTitle, DialogContent, DialogActions, Button, FormGroup, FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { LOCALSTORAGE_KEY } from './Schedule';

const COLUMNS_COUNT = 2;

export interface SelectCoursesDialogProps {
    isOpen: boolean;
    possibleCourses: string[];
    onClose(): void;
}

const useStyles = makeStyles(theme => ({
    courseNamesListsWrapper: {
        display: 'flex',
        flexDirection: 'row'
    },
    formGroup: {
        width: '50%'
    }
}))

export const SelectCoursesDialog = memo<SelectCoursesDialogProps>(({ isOpen, possibleCourses, onClose }) => {
    const styles = useStyles();

    const [selectedCourses, setSelectedCourses] = useState<string[]>(possibleCourses);

    useEffect(() => {
        try {
            const persistedCourseList = localStorage.getItem(LOCALSTORAGE_KEY);
            if (persistedCourseList) {
                setSelectedCourses(JSON.parse(persistedCourseList));
            }
        } catch { }
    }, []);

    const isSelected = (courseName: string) => selectedCourses.indexOf(courseName) > -1;

    const toggle = (courseName: string) => {
        if (isSelected(courseName)) {
            setSelectedCourses(selectedCourses.filter(c => c !== courseName));
        } else {
            setSelectedCourses([...selectedCourses, courseName]);
        }
    }

    const saveAndClose = () => {
        try {
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(selectedCourses))
        } catch (e) {
            console.error(e);
        }
        onClose();
    }

    return (
        <ResponsiveFullScreenDialog open={isOpen} fullWidth>
            <DialogTitle>Kurse filtern</DialogTitle>
            <DialogContent>
                <div className={styles.courseNamesListsWrapper}>
                    {chunk(possibleCourses, Math.ceil(possibleCourses.length / COLUMNS_COUNT)).map((courses, i) => (
                        <FormGroup key={i} className={styles.formGroup}>
                            {courses.map(courseName => (
                                <FormControlLabel
                                    key={courseName}
                                    control={<Checkbox checked={isSelected(courseName)} onChange={() => toggle(courseName)} value={courseName} />}
                                    label={courseName}
                                />
                            ))}
                        </FormGroup>
                    ))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => onClose()}
                    color="secondary"
                    variant="outlined"
                >
                    Abbrechen
                </Button>
                <Button
                    type={'submit'}
                    color="secondary"
                    variant="contained"
                    onClick={() => saveAndClose()}
                >
                    Filter speichern
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});