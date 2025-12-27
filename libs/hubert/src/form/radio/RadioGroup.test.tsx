import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, userEvent } from '../../test-utils';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

describe('shared/general/form/radio', () => {
  it('should render with correct name', () => {
    const screen = render(
      <RadioGroup name={'form-name'}>
        <Radio value={'0'} label={'0'} />
        <Radio value={'1'} label={'1'} />
        <Radio value={'2'} label={'2'} />
        <Radio value={'3'} label={'3'} />
      </RadioGroup>
    );
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios).toHaveLength(4);
    expect(radios.every((r) => r.name === 'form-name')).toBeTruthy();
  });

  it('should have the correct value selected when value prop is given', () => {
    const screen = render(
      <RadioGroup name={'form-name'} value={'2'}>
        <Radio value={'0'} label={'0'} />
        <Radio value={'1'} label={'1'} />
        <Radio value={'2'} label={'2'} />
        <Radio value={'3'} label={'3'} />
      </RadioGroup>
    );
    expect(screen.getByRole('radio', { name: '2' })).toBeChecked();
  });

  it('should call onChange with the newly selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn((ev, val) => {
      expect(ev.type).toEqual('change');
      expect(val).toEqual('3');
    });

    const screen = render(
      <RadioGroup name={'form-name'} onChange={onChange}>
        <Radio value={'0'} label={'0'} />
        <Radio value={'1'} label={'1'} />
        <Radio value={'2'} label={'2'} />
        <Radio value={'3'} label={'3'} />
      </RadioGroup>
    );

    await user.click(screen.getByRole('radio', { name: '3' }));
    expect(onChange).toHaveBeenCalled();
  });
});
