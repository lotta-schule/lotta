import { render } from '@testing-library/react';
import { Table } from './Table';

describe('Table', () => {
    it('should render', () => {
        const screen = render(
            <Table>
                <thead>
                    <tr>
                        <td>Header 1</td>
                        <td>Header 2</td>
                        <td>Header 3</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Content 1</td>
                        <td>Content 2</td>
                        <td>Content 3</td>
                    </tr>
                    <tr>
                        <td>Content 1</td>
                        <td>Content 2</td>
                        <td>Content 3</td>
                    </tr>
                    <tr>
                        <td>Content 1</td>
                        <td>Content 2</td>
                        <td>Content 3</td>
                    </tr>
                </tbody>
            </Table>
        );
        expect(screen.container).toMatchSnapshot();
    });
});
