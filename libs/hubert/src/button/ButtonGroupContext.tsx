import * as React from 'react';

export type ButtonGroupContextType = {
  grouped: boolean;
};

export const ButtonGroupContext = React.createContext<ButtonGroupContextType>({
  grouped: false,
});

export const ButtonGroupContextProvider = ({
  reset,
  children,
}: React.PropsWithChildren<{ reset?: boolean }>) => (
  <ButtonGroupContext.Provider value={{ grouped: !reset }}>
    {children}
  </ButtonGroupContext.Provider>
);

export const useButtonGroupContext = () => {
  return React.useContext(ButtonGroupContext);
};
