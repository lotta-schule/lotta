import * as React from 'react';
import { Category } from '@material-ui/icons';
import { AdminPage } from 'administration/AdminPage';
import { CategoryList } from 'administration/categories/CategoryList';
import { GetServerSidePropsContext } from 'next';

const CategoryListRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Category /> Kategorien
                </>
            }
            component={CategoryList}
            hasHomeLink
        />
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default CategoryListRoute;
