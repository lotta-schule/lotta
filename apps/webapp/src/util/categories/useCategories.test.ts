import { renderHook, waitFor } from 'test/util';
import {
  StartseiteCategory,
  FaecherCategory,
  MaterialCategory,
  ImpressumCategory,
  DatenschutzCategory,
  MatheCategory,
  SportCategory,
  KunstCategory,
} from 'test/fixtures';
import { useCategories } from './useCategories';

describe('useCategories', () => {
  describe('category sorting', () => {
    it('should sort categories with homepage first, then non-sidenav, then sidenav, then by sortKey', async () => {
      const { result } = renderHook(() => useCategories(), undefined, {
        categories: () => [
          DatenschutzCategory, // isSidenav: true, sortKey: 10
          FaecherCategory, // isSidenav: false, sortKey: 1
          StartseiteCategory, // isHomepage: true, sortKey: 0
          ImpressumCategory, // isSidenav: true, sortKey: 7
          MaterialCategory, // isSidenav: false, sortKey: 5
        ],
      });

      await waitFor(() => {
        const [categories] = result.current;
        expect(categories).toHaveLength(5);
      });

      const [categories] = result.current;

      // Homepage should be first
      expect(categories[0].id).toBe(StartseiteCategory.id);

      // Non-sidenav categories should come next, sorted by sortKey
      expect(categories[1].id).toBe(FaecherCategory.id); // sortKey: 1
      expect(categories[2].id).toBe(MaterialCategory.id); // sortKey: 5

      // Sidenav categories should come last, sorted by sortKey
      expect(categories[3].id).toBe(ImpressumCategory.id); // sortKey: 7
      expect(categories[4].id).toBe(DatenschutzCategory.id); // sortKey: 10
    });

    it('should sort categories with same properties by sortKey', async () => {
      const category1 = { ...FaecherCategory, sortKey: 10 };
      const category2 = { ...MaterialCategory, sortKey: 5 };
      const category3 = { ...FaecherCategory, id: '99', sortKey: 1 };

      const { result } = renderHook(() => useCategories(), undefined, {
        categories: () => [category1, category2, category3],
      });

      await waitFor(() => {
        const [categories] = result.current;
        expect(categories).toHaveLength(3);
      });

      const [categories] = result.current;
      expect(categories[0].sortKey).toBe(1);
      expect(categories[1].sortKey).toBe(5);
      expect(categories[2].sortKey).toBe(10);
    });
  });

  describe('withIndentedLabels', () => {
    it('should create indented labels for hierarchical categories', async () => {
      const { result } = renderHook(() => useCategories(), undefined, {
        categories: () => [
          StartseiteCategory,
          FaecherCategory,
          MaterialCategory,
          // subcategory of Fächer:
          MatheCategory,
          SportCategory,
          KunstCategory,
        ],
      });

      await waitFor(() => {
        const [, { withIndentedLabels }] = result.current;
        expect(withIndentedLabels).toHaveLength(6);
      });

      const [, { withIndentedLabels }] = result.current;

      // Homepage should be first (no indent)
      expect(withIndentedLabels[0].category.id).toBe(StartseiteCategory.id);
      expect(withIndentedLabels[0].indentedLabel).toBe('Start');

      // Parent category (no indent)
      expect(withIndentedLabels[1].category.id).toBe(FaecherCategory.id);
      expect(withIndentedLabels[1].indentedLabel).toBe('Fächer');

      // Subcategories should have indent prefix and be sorted by sortKey
      expect(withIndentedLabels[2].category.id).toBe(MatheCategory.id);
      expect(withIndentedLabels[2].indentedLabel).toBe('⎯ Mathe');

      expect(withIndentedLabels[3].category.id).toBe(SportCategory.id);
      expect(withIndentedLabels[3].indentedLabel).toBe('⎯ Sport');

      expect(withIndentedLabels[4].category.id).toBe(KunstCategory.id);
      expect(withIndentedLabels[4].indentedLabel).toBe('⎯ Kunst');

      expect(withIndentedLabels[5].category.id).toBe(MaterialCategory.id);
      expect(withIndentedLabels[5].indentedLabel).toBe('Material');
    });

    it('should only include top-level categories and their direct children', async () => {
      const { result } = renderHook(() => useCategories(), undefined, {
        categories: () => [
          StartseiteCategory,
          FaecherCategory,
          MatheCategory, // child of Fächer
        ],
      });

      await waitFor(() => {
        const [, { withIndentedLabels }] = result.current;
        expect(withIndentedLabels).toHaveLength(3);
      });

      const [, { withIndentedLabels }] = result.current;

      // Should have: Startseite, Fächer, ⎯ Mathe
      expect(withIndentedLabels[0].category.id).toBe(StartseiteCategory.id);
      expect(withIndentedLabels[1].category.id).toBe(FaecherCategory.id);
      expect(withIndentedLabels[2].category.id).toBe(MatheCategory.id);
    });

    it('should group subcategories under their parent', async () => {
      const { result } = renderHook(() => useCategories(), undefined, {
        categories: () => [
          StartseiteCategory,
          FaecherCategory,
          MaterialCategory,
          MatheCategory, // child of Fächer
          SportCategory, // child of Fächer
        ],
      });

      await waitFor(() => {
        const [, { withIndentedLabels }] = result.current;
        expect(withIndentedLabels).toHaveLength(5);
      });

      const [, { withIndentedLabels }] = result.current;

      // Should be: Startseite, Fächer, ⎯ Mathe, ⎯ Sport, Material
      expect(withIndentedLabels[0].category.id).toBe(StartseiteCategory.id);
      expect(withIndentedLabels[1].category.id).toBe(FaecherCategory.id);
      expect(withIndentedLabels[2].category.id).toBe(MatheCategory.id);
      expect(withIndentedLabels[3].category.id).toBe(SportCategory.id);
      expect(withIndentedLabels[4].category.id).toBe(MaterialCategory.id);
    });
  });

  describe('return structure', () => {
    it('should return a tuple with categories and utilities object', async () => {
      const { result } = renderHook(() => useCategories(), undefined, {
        categories: () => [StartseiteCategory],
      });

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
      });

      const [categories, utils] = result.current;

      expect(Array.isArray(categories)).toBe(true);
      expect(typeof utils).toBe('object');
      expect(utils).toHaveProperty('withIndentedLabels');
      expect(Array.isArray(utils.withIndentedLabels)).toBe(true);
    });
  });

  describe('memoization', () => {
    it('should memoize the categories array', async () => {
      const { result, rerender } = renderHook(
        () => useCategories(),
        undefined,
        {
          categories: () => [StartseiteCategory],
        }
      );

      await waitFor(() => {
        const [categories] = result.current;
        expect(categories).toHaveLength(1);
      });

      const [firstCategories] = result.current;

      // Rerender without data change
      rerender();

      const [secondCategories] = result.current;

      // Should be the same reference due to memoization
      expect(firstCategories).toBe(secondCategories);
    });
  });
});
