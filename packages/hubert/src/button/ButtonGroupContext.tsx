import * as React from 'react';

export type ButtonGroupContextType = {
  grouped: boolean;
};

export const ButtonGroupContext = React.createContext<ButtonGroupContextType>({
  grouped: false,
});

export const ButtonGroupContextProvider = ({
  children,
}: {
  children: React.ReactChild;
}) => (
  <ButtonGroupContext.Provider value={{ grouped: true }}>
    {children}
  </ButtonGroupContext.Provider>
);

export const useButtonGroupContext = () => {
  return React.useContext(ButtonGroupContext);
};
