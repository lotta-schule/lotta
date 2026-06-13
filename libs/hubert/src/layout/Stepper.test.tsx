import * as React from 'react';
import { render, userEvent } from '../test-utils';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('should render a stepper', () => {
    const screen = render(
      <Stepper currentStep={0} maxSteps={3} onStep={vi.fn()} />
    );
    expect(screen.getByRole('spinbutton')).toMatchSnapshot();
  });

  it('should render the correct step count', () => {
    const screen = render(
      <Stepper currentStep={0} maxSteps={3} onStep={vi.fn()} />
    );
    expect(screen.getByText('1 / 3')).toBeVisible();
  });

  describe('previous step', () => {
    it('should select the previous step on button click', async () => {
      const fireEvent = userEvent.setup();
      const onStep = vi.fn();
      const screen = render(
        <Stepper currentStep={1} maxSteps={3} onStep={onStep} />
      );
      await fireEvent.click(screen.getByRole('button', { name: /vorherig/i }));
      expect(onStep).toHaveBeenCalledWith(0);
    });

    it('should disable previous button when on first step', () => {
      const screen = render(
        <Stepper currentStep={0} maxSteps={3} onStep={vi.fn()} />
      );
      expect(screen.getByRole('button', { name: /vorherig/i })).toBeDisabled();
    });
  });

  describe('next step', () => {
    it('should select the next step on button click', async () => {
      const fireEvent = userEvent.setup();
      const onStep = vi.fn();
      const screen = render(
        <Stepper currentStep={1} maxSteps={3} onStep={onStep} />
      );
      await fireEvent.click(screen.getByRole('button', { name: /nächst/i }));
      expect(onStep).toHaveBeenCalledWith(2);
    });

    it('should disable previous button when on first step', () => {
      const screen = render(
        <Stepper currentStep={2} maxSteps={3} onStep={vi.fn()} />
      );
      expect(screen.getByRole('button', { name: /nächst/i })).toBeDisabled();
    });
  });
});
