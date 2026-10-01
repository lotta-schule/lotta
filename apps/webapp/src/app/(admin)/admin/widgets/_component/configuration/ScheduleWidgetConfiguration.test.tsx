import { render, waitFor, userEvent } from '#/test/util';
import { ScheduleWidgetConfiguration } from './ScheduleWidgetConfiguration';

describe('administration/widgets/configuration/ScheduleWidgetConfiguration', () => {
  describe('defaulting the "type" property', () => {
    it('should default the type to "IndiwareStudent" when unset', async () => {
      const setConfiguration = vi.fn();
      render(
        <ScheduleWidgetConfiguration
          configuration={{}}
          setConfiguration={setConfiguration}
        />
      );

      await waitFor(() => {
        expect(setConfiguration).toHaveBeenCalledWith({
          type: 'IndiwareStudent',
        });
      });
    });

    it('should keep other configuration fields when defaulting the type', async () => {
      const setConfiguration = vi.fn();
      render(
        <ScheduleWidgetConfiguration
          configuration={{ schoolId: '12345', username: 'user' }}
          setConfiguration={setConfiguration}
        />
      );

      await waitFor(() => {
        expect(setConfiguration).toHaveBeenCalledWith({
          schoolId: '12345',
          username: 'user',
          type: 'IndiwareStudent',
        });
      });
    });

    it('should not touch the configuration when a type is already set', () => {
      const setConfiguration = vi.fn();
      render(
        <ScheduleWidgetConfiguration
          configuration={{ type: 'IndiwareTeacher', schoolId: '12345' }}
          setConfiguration={setConfiguration}
        />
      );

      expect(setConfiguration).not.toHaveBeenCalled();
    });
  });

  describe('rendering and updating values', () => {
    it('should show the configuration section', () => {
      const screen = render(
        <ScheduleWidgetConfiguration
          configuration={{ type: 'IndiwareStudent' }}
          setConfiguration={vi.fn()}
        />
      );

      expect(screen.getByTestId('ScheduleWidgetConfiguration')).toBeVisible();
    });

    it('should show the currently selected type', () => {
      const screen = render(
        <ScheduleWidgetConfiguration
          configuration={{ type: 'IndiwareTeacher' }}
          setConfiguration={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: /Indiware - Lehrer/ })
      ).toBeVisible();
    });

    it('should update the type when a different option is selected', async () => {
      const fireEvent = userEvent.setup();
      const setConfiguration = vi.fn();
      const screen = render(
        <ScheduleWidgetConfiguration
          configuration={{ type: 'IndiwareStudent', schoolId: '12345' }}
          setConfiguration={setConfiguration}
        />
      );

      await fireEvent.click(
        screen.getByRole('button', { name: /Indiware - Schüler/ })
      );
      await fireEvent.click(
        await screen.findByRole('option', { name: /Indiware - Lehrer/ })
      );

      expect(setConfiguration).toHaveBeenCalledWith({
        type: 'IndiwareTeacher',
        schoolId: '12345',
      });
    });

    it('should update the schoolId when the Schulnummer input changes', async () => {
      const fireEvent = userEvent.setup();
      const setConfiguration = vi.fn();
      const screen = render(
        <ScheduleWidgetConfiguration
          configuration={{ type: 'IndiwareStudent' }}
          setConfiguration={setConfiguration}
        />
      );

      await fireEvent.fill(screen.getByLabelText('Schulnummer'), '54321');

      expect(setConfiguration).toHaveBeenCalledWith({
        type: 'IndiwareStudent',
        schoolId: '54321',
      });
    });

    it('should update the username when the Nutzername input changes', async () => {
      const fireEvent = userEvent.setup();
      const setConfiguration = vi.fn();
      const screen = render(
        <ScheduleWidgetConfiguration
          configuration={{ type: 'IndiwareStudent' }}
          setConfiguration={setConfiguration}
        />
      );

      await fireEvent.fill(
        screen.getByLabelText('Nutzername'),
        'maxmustermann'
      );

      expect(setConfiguration).toHaveBeenCalledWith({
        type: 'IndiwareStudent',
        username: 'maxmustermann',
      });
    });

    it('should update the password when the Passwort input changes', async () => {
      const fireEvent = userEvent.setup();
      const setConfiguration = vi.fn();
      const screen = render(
        <ScheduleWidgetConfiguration
          configuration={{ type: 'IndiwareStudent' }}
          setConfiguration={setConfiguration}
        />
      );

      await fireEvent.fill(screen.getByLabelText('Passwort'), 'secret123');

      expect(setConfiguration).toHaveBeenCalledWith({
        type: 'IndiwareStudent',
        password: 'secret123',
      });
    });
  });
});
