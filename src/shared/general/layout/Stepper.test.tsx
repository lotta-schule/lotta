import userEvent from '@testing-library/user-event';
import { render } from 'test/util';
import { Stepper } from './Stepper';

describe('Stepper', () => {
    it('should render a stepper', () => {
        const screen = render(
            <Stepper currentStep={0} maxSteps={3} onStep={jest.fn()} />
        );
        expect(screen.container).toMatchSnapshot();
    });

    it('should render the correct step count', () => {
        const screen = render(
            <Stepper currentStep={0} maxSteps={3} onStep={jest.fn()} />
        );
        expect(screen.getByText('1 / 3')).toBeVisible();
    });

    describe('previous step', () => {
        it('should select the previous step on button click', () => {
            const onStep = jest.fn();
            const screen = render(
                <Stepper currentStep={1} maxSteps={3} onStep={onStep} />
            );
            userEvent.click(screen.getByRole('button', { name: /vorherig/i }));
            expect(onStep).toHaveBeenCalledWith(0);
        });

        it('should disable previous button when on first step', () => {
            const screen = render(
                <Stepper currentStep={0} maxSteps={3} onStep={jest.fn()} />
            );
            expect(
                screen.getByRole('button', { name: /vorherig/i })
            ).toBeDisabled();
        });
    });

    describe('next step', () => {
        it('should select the next step on button click', () => {
            const onStep = jest.fn();
            const screen = render(
                <Stepper currentStep={1} maxSteps={3} onStep={onStep} />
            );
            userEvent.click(screen.getByRole('button', { name: /nächst/i }));
            expect(onStep).toHaveBeenCalledWith(2);
        });

        it('should disable previous button when on first step', () => {
            const screen = render(
                <Stepper currentStep={2} maxSteps={3} onStep={jest.fn()} />
            );
            expect(
                screen.getByRole('button', { name: /nächst/i })
            ).toBeDisabled();
        });
    });
});
