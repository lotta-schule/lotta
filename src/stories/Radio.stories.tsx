import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import {
    Radio,
    RadioGroup,
    RadioGroupProps,
} from 'component/general/form/radio';

export default {
    title: 'Form/Radio',
    component: Radio,
    argTypes: {},
} as Meta;

const Template: Story<Omit<RadioGroupProps, 'ref'>> = (args) => (
    <RadioGroup name={'radio-group'}>
        <Radio value={'0'}>Option 0</Radio>
        <Radio value={'1'}>Option 1</Radio>
        <Radio value={'2'}>Option 2</Radio>
        <Radio value={'3'}>Option 3</Radio>
        <Radio value={'4'}>Option 4</Radio>
    </RadioGroup>
);

const ColoredTemplate: Story<Omit<RadioGroupProps, 'ref'>> = (args) => (
    <RadioGroup name={'radio-group'}>
        <Radio featureColor={'red'} value={'0'}>
            Option 0
        </Radio>
        <Radio featureColor={'green'} value={'1'}>
            Option 1
        </Radio>
        <Radio featureColor={'yellow'} value={'2'}>
            Option 2
        </Radio>
        <Radio featureColor={'pink'} value={'3'}>
            Option 3
        </Radio>
        <Radio featureColor={'brown'} value={'4'}>
            Option 4
        </Radio>
    </RadioGroup>
);

export const Default = Template.bind({});
Default.args = {};

export const Colored = ColoredTemplate.bind({});
Colored.args = {};
