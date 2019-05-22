import React, { memo } from 'react';
import { connect } from 'react-redux';
import { CategoryModel } from '../../model';
import { State } from '../../store/State';
import { BaseLayout, BaseLayoutProps } from './BaseLayout';

interface ConnectedBaseLayoutStateProps {
    categories?: CategoryModel[];
}

export const ConnectedBaseLayout = connect<ConnectedBaseLayoutStateProps, {}, BaseLayoutProps, State>(
    state => ({
        categories: state.content.categories
    })
)(memo<{} & Partial<ConnectedBaseLayoutStateProps>>(({ categories, ...baseLayoutProps }) => (
    <BaseLayout categories={categories} {...baseLayoutProps} />
)));