import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Stepper, StepperProps } from '@lotta-schule/hubert';

export default {
  title: 'Layout/Stepper',
  component: Stepper,
  argTypes: {},
} as Meta;

const Template: StoryFn<{
  args: Omit<StepperProps, 'currentStep' | 'onStep'>;
  content: React.ReactElement;
}> = ({ args }) => {
  const getRandomAvatarUrl = (step: number) =>
    `https://avatars.dicebear.com/api/avataaars/${step}.svg`;
  const [step, setStep] = React.useState(2);
  return (
    <div>
      <Stepper currentStep={step} onStep={setStep} {...args} />
      <img
        src={getRandomAvatarUrl(step)}
        alt={`Image Step ${step}`}
        style={{ width: 300 }}
      />
    </div>
  );
};

export const Default = {
  render: Template,

  args: {
    args: {
      maxSteps: 4,
    },
  },
};
