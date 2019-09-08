import React, { PureComponent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';


export default class SortControl extends PureComponent {
  render() {
    const { sortText, currentMode, desc } = this.props;

    const modes = Object.keys(sortText);
    return modes.map((mode) => {
      let sortIcon = null;
      if (currentMode === mode) {
        sortIcon = (
            <span className="ml-2">
                <FontAwesomeIcon icon={desc === 'true' ? faSortDown : faSortUp} />
            </span>
        );
      }

      return (
          <span className="text-white ml-2 btn"
                key={mode}
                onClick={() => this.setOtherBy(mode)}
                style={{ fontWeight: currentMode === mode ? 700 : 300 }}>
                {sortText[mode]}
                {sortIcon}
            </span>
      );
    });
  }
}