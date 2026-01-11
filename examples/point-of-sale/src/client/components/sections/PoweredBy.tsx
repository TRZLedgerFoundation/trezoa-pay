import React, { FC } from 'react';
import { TrezoaPayLogo } from '../images/TrezoaPayLogo';
import css from './PoweredBy.module.css';

export const PoweredBy: FC = () => {
    return (
        <div className={css.root}>
            Powered by <TrezoaPayLogo />
        </div>
    );
};
