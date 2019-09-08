import React from 'react';
import { faUnlink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NOT_FOUND_MSG = 'Trang không tồn tại';

const styles = {
  icon: {
    marginRight: 20,
  },
  txt: {}
};

export default () => <div className="d-flex justify-content-center">
    <h1>
        <FontAwesomeIcon icon={faUnlink} style={styles.icon} />
        <span style={styles.txt}>{NOT_FOUND_MSG}</span>
    </h1>
</div>;