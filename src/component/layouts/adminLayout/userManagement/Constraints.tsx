import React, { memo, useState } from 'react';
import { Grid, InputAdornment, Slider, TextField, Typography } from '@material-ui/core';
import { SdStorage } from '@material-ui/icons';
import { useSystem } from 'util/client/useSystem';
import { SaveButton } from 'component/general/SaveButton';
import { useMutation } from '@apollo/client';
import { UpdateSystemMutation } from 'api/mutation/UpdateSystemMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';

export const Constraints = memo(() => {
    const system = useSystem();
    const [value, setValue] = useState(system.userMaxStorageConfig ?? 20);
    const [isShowSuccess, setIsShowSuccess] = useState(false);

    const [updateSystem, { loading: isLoading, error }] = useMutation(UpdateSystemMutation, {
        variables: { system: { userMaxStorageConfig: value } },
        onCompleted: () => {
            setIsShowSuccess(true);
            setTimeout(() => setIsShowSuccess(false), 3000);
        }
    });

    return (
        <>
            <Typography variant={'h5'}>Speicherplatz-Beschränkungen</Typography>
            <div>
                <Typography id={`user-storage-limit`} gutterBottom>
                    Freier Speicher für jeden Nutzer
                </Typography>
                <ErrorMessage error={error} />
                <Typography variant={'body2'} component={'div'}>
                    <p>
                        Der freie Speicher für jeden Nutzer bestimmt, wie viel persönlicher Speicherplatz jeder Nutzer
                        durch seine Anmeldung zur Verfügung gestellt bekommt.
                    </p>
                    <p>
                        Er bestimmt neben dem Speicher, den der Nutzer durch seine Gruppen zur Verfügung gestellt bekommt,
                        wie viele Medien Nutzer online vorhalten können.
                    </p>
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <SdStorage />
                    </Grid>
                    <Grid item xs>
                        <Slider
                            value={value}
                            onChange={(_e, value) => setValue(value as number)}
                            aria-labelledby={'user-storage-limit'}
                            step={50}
                            min={0}
                            max={2_000}
                            marks={true}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            label={''}
                            value={value}
                            onChange={({ currentTarget }) => {
                                if (currentTarget.value) {
                                    setValue(parseInt(currentTarget.value));
                                }
                            }}
                            InputProps={{
                                startAdornment: <InputAdornment position={'start'}>MB</InputAdornment>,
                            }}
                            inputProps={{
                                step: 50,
                                min: 0,
                                type: 'number',
                                'aria-labelledby': 'user-storage-limit',
                            }}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <SaveButton onClick={() => updateSystem()} isLoading={isLoading} isSuccess={isShowSuccess}>
                    Speichern
                </SaveButton>
            </div>
        </>
    );
});
