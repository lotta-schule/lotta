import * as React from 'react';
import { SearchPage } from 'search/SearchPage';
import { GetServerSidePropsContext } from 'next';

const SearchRoute = () => {
  return <SearchPage />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
  return {
    props: {},
  };
};

export default SearchRoute;
