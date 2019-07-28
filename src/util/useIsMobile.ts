import { useMediaQuery, Theme } from "@material-ui/core";

export const useIsMobile = (): boolean => {
    return useMediaQuery((theme: Theme) => {
        return theme.breakpoints.down('sm');
    });
}