import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Radio, RadioGroup, RadioGroupProps } from 'shared/general/form/radio';

export default {
    title: 'Form/Radio',
    component: Radio,
    argTypes: {},
} as Meta;

const Template: Story<Omit<RadioGroupProps, 'ref'>> = (args) => {
    const [val, setVal] = React.useState('0');
    return (
        <RadioGroup
            {...args}
            name={'radio-group'}
            value={val}
            onChange={(_e, val) => setVal(val.toString())}
        >
            <Radio value={'0'}>Option 0</Radio>
            <Radio value={'1'}>Option 1</Radio>
            <Radio value={'2'}>Option 2</Radio>
            <Radio value={'3'}>Option 3</Radio>
            <Radio value={'4'}>Option 4</Radio>
        </RadioGroup>
    );
};

const ColoredTemplate: Story<Omit<RadioGroupProps, 'ref'>> = (args) => (
    <RadioGroup {...args} name={'radio-group'}>
        <Radio featureColor={[255, 0, 0]} value={'0'}>
            Option 0
        </Radio>
        <Radio featureColor={[0, 255, 0]} value={'1'}>
            Option 1
        </Radio>
        <Radio featureColor={[255, 255, 0]} value={'2'}>
            Option 2
        </Radio>
        <Radio featureColor={[255, 120, 120]} value={'3'}>
            Option 3
        </Radio>
        <Radio featureColor={[220, 175, 175]} value={'4'}>
            Option 4
        </Radio>
    </RadioGroup>
);

export const Default = Template.bind({});
Default.args = {};

export const Colored = ColoredTemplate.bind({});
Colored.args = {};
