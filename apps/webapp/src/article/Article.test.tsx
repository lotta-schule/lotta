import { render } from 'test/util';
import { Article } from './Article';
import { ComputerExperten, VivaLaRevolucion } from 'test/fixtures';

const articleWithReactionsEnabled = ComputerExperten;
const articoleWithoutReactionsEnabled = VivaLaRevolucion;

describe('Article', () => {
  it("should show the article's title", () => {
    const screen = render(<Article article={ComputerExperten} />);

    expect(screen.getByText(ComputerExperten.title)).toBeVisible();
  });

  it("should show the article's contentmodules", () => {
    const screen = render(<Article article={ComputerExperten} />);

    expect(screen.queryAllByTestId('ContentModule')).toHaveLength(
      ComputerExperten.contentModules.length
    );
  });

  describe('Reactions', () => {
    it('should show the reactions if enabled', () => {
      const screen = render(<Article article={articleWithReactionsEnabled} />);

      expect(screen.getByTestId('ArticleReactions')).toBeVisible();
    });

    it('should not show the reactions if disabled', () => {
      const screen = render(
        <Article article={articoleWithoutReactionsEnabled} />
      );

      expect(screen.queryByTestId('ArticleReactions')).toBeNull();
    });
  });
});
