import { render } from '../test-utils';
import * as Icons from '.';

describe('Icon Components', () => {
  const iconComponents = [
    'ArrowUpwardRounded',
    'AttachFile',
    'Check',
    'CheckboxIcon',
    'Checklist',
    'ChevronRight',
    'Close',
    'CloudUpload',
    'Copy',
    'CreateNewFolder',
    'Delete',
    'DeleteOutline',
    'Download',
    'DragHandle',
    'Edit',
    'Eduplaces',
    'ExpandMore',
    'File',
    'FileArchive',
    'FileAudio',
    'FileImage',
    'FilePDF',
    'FilePowerPoint',
    'FileTable',
    'FileText',
    'FileVideo',
    'Folder',
    'FolderOpen',
    'Home',
    'KeyboardArrowLeft',
    'KeyboardArrowRight',
    'Mail',
    'MoreVert',
    'MoveArrow',
    'OpenWith',
    'Person',
    'RadioButton',
    'TextFormat',
    'TextLines',
  ] as const;

  iconComponents.forEach((iconName) => {
    it(`should render ${iconName} without crashing`, () => {
      const IconComponent = Icons[iconName as keyof typeof Icons];
      expect(() => render(<IconComponent />)).not.toThrow();
    });

    it(`should render ${iconName} with custom className`, () => {
      const IconComponent = Icons[iconName as keyof typeof Icons];
      const { container } = render(<IconComponent className="custom-class" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });

    it(`should render ${iconName} with data-testid`, () => {
      const IconComponent = Icons[iconName as keyof typeof Icons];
      const { container } = render(<IconComponent />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('data-testid');
    });
  });
});
