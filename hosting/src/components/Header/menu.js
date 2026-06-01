import React from 'react';
import { Link } from 'gatsby';

import MENUS from '../../constants/menu';

export default ({ authUser }) => (
    <div className="pt-nav" style={{ justifyContent: 'center', marginBottom: '8px' }}>
        {
            MENUS.map((item) => {
              if (item.auth && !authUser) return null;
              return (
                    <Link key={item.path}
                        to={item.path}
                        activeStyle={{ fontWeight: 700 }}>
                        {item.text}
                    </Link>
              );
            })
        }
    </div>
);