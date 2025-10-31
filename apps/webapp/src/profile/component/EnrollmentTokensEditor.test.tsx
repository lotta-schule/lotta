import * as React from 'react';
import { render, waitFor } from 'test/util';
import { EnrollmentTokensEditor } from './EnrollmentTokensEditor';
import userEvent from '@testing-library/user-event';

// Wrapper component that simulates real parent component behavior
const EnrollmentTokensEditorWrapper = ({
  initialTokens = [],
  disabled = false,
  onTokensChange,
}: {
  initialTokens?: string[];
  disabled?: boolean;
  onTokensChange?: (tokens: string[]) => void;
}) => {
  const [tokens, setTokens] = React.useState<string[]>(initialTokens);

  const handleSetTokens = React.useCallback(
    (newTokens: string[]) => {
      setTokens(newTokens);
      onTokensChange?.(newTokens);
    },
    [onTokensChange]
  );

  return (
    <EnrollmentTokensEditor
      tokens={tokens}
      setTokens={handleSetTokens}
      disabled={disabled}
    />
  );
};

describe('shared/EnrollmentTokensEditor', () => {
  it('should render an empty token list when no token were passed', () => {
    const screen = render(<EnrollmentTokensEditorWrapper />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('show a list of tokens', () => {
    const screen = render(
      <EnrollmentTokensEditorWrapper
        initialTokens={['token1', 'token2', 'token3']}
      />
    );
    expect(screen.queryAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.queryAllByRole('listitem').map((el) => el.textContent)
    ).toEqual(['token1', 'token2', 'token3']);
  });

  it('show the input as disabled when disabled prop is given', () => {
    const screen = render(
      <EnrollmentTokensEditorWrapper
        disabled
        initialTokens={['token1', 'token2', 'token3']}
      />
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  describe('adding an enrollment token', () => {
    it('should add an entered token on ENTER', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', 'token3', '']}
          onTokensChange={onTokensChange}
        />
      );
      await fireEvent.type(screen.getByRole('textbox'), 'newtoken');
      await fireEvent.keyboard('{enter}');
      await waitFor(() => {
        const calls = onTokensChange.mock.calls;
        const finalCall = calls[calls.length - 1][0];
        expect(finalCall).toContain('newtoken');
        expect(finalCall[finalCall.length - 1]).toBe('');
      });
    });

    it('should add an entered token on blur', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', 'token3', '']}
          onTokensChange={onTokensChange}
        />
      );
      await fireEvent.type(screen.getByRole('textbox'), 'newtoken');
      await fireEvent.tab();
      await waitFor(() => {
        const calls = onTokensChange.mock.calls;
        const finalCall = calls[calls.length - 1][0];
        expect(finalCall).toContain('newtoken');
        expect(finalCall[finalCall.length - 1]).toBe('');
      });
    });

    it('should split tokens on comma', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['']}
          onTokensChange={onTokensChange}
        />
      );
      await fireEvent.type(screen.getByRole('textbox'), 'tok1,tok2');
      await waitFor(() => {
        expect(onTokensChange).toHaveBeenCalled();
        const calls = onTokensChange.mock.calls;
        const finalCall = calls[calls.length - 1][0];
        expect(finalCall).toContain('tok1');
        expect(finalCall).toContain('tok2');
      });
    });

    it('should split tokens on space', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['']}
          onTokensChange={onTokensChange}
        />
      );
      await fireEvent.type(screen.getByRole('textbox'), 'tok1 tok2');
      await waitFor(() => {
        expect(onTokensChange).toHaveBeenCalled();
        const calls = onTokensChange.mock.calls;
        const finalCall = calls[calls.length - 1][0];
        expect(finalCall).toContain('tok1');
        expect(finalCall).toContain('tok2');
      });
    });

    it('should prevent duplicate tokens when confirming', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', 'token3', '']}
          onTokensChange={onTokensChange}
        />
      );
      await fireEvent.type(screen.getByRole('textbox'), 'token1');
      await fireEvent.keyboard('{enter}');
      await waitFor(() => {
        const calls = onTokensChange.mock.calls;
        const finalCall = calls[calls.length - 1][0];
        // Should not have duplicate token1
        const token1Count = finalCall.filter(
          (t: string) => t === 'token1'
        ).length;
        expect(token1Count).toBe(1);
      });
    });
  });

  describe('removing tokens', () => {
    it('should remove a token when delete button is clicked', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', 'token3']}
          onTokensChange={onTokensChange}
        />
      );
      const deleteButtons = screen.getAllByLabelText(/löschen/i);
      await fireEvent.click(deleteButtons[1]);
      await waitFor(() => {
        expect(onTokensChange).toHaveBeenCalledWith(['token1', 'token3']);
      });
    });

    it('should clear input when Escape is pressed', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', 'token3', '']}
          onTokensChange={onTokensChange}
        />
      );
      await fireEvent.type(screen.getByRole('textbox'), 'newtoken');
      onTokensChange.mockClear(); // Clear previous calls from typing
      await fireEvent.keyboard('{Escape}');
      await waitFor(() => {
        expect(onTokensChange).toHaveBeenCalled();
        const calls = onTokensChange.mock.calls;
        const finalCall = calls[calls.length - 1][0];
        expect(finalCall).toEqual(['token1', 'token2', 'token3']);
      });
    });

    it('should not do anything when Escape is pressed with empty input', async () => {
      const fireEvent = userEvent.setup();
      const onTokensChange = vi.fn();
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', 'token3', '']}
          onTokensChange={onTokensChange}
        />
      );
      await fireEvent.click(screen.getByRole('textbox'));
      await fireEvent.keyboard('{Escape}');
      expect(onTokensChange).not.toHaveBeenCalled();
    });
  });

  describe('token list display', () => {
    it('should filter out empty tokens from display', () => {
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', '', 'token2', '', 'token3']}
        />
      );
      expect(screen.queryAllByRole('listitem')).toHaveLength(3);
      expect(
        screen.queryAllByRole('listitem').map((el) => el.textContent)
      ).toEqual(['token1', 'token2', 'token3']);
    });

    it('should show the last token as input value when it exists', () => {
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', 'editing']}
        />
      );
      expect(screen.getByRole('textbox')).toHaveValue('editing');
    });

    it('should show empty input when last token is empty string', () => {
      const screen = render(
        <EnrollmentTokensEditorWrapper
          initialTokens={['token1', 'token2', '']}
        />
      );
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('should show empty input when tokens array is empty', () => {
      const screen = render(
        <EnrollmentTokensEditorWrapper initialTokens={[]} />
      );
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });
});
