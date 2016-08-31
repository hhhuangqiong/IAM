import React from 'react';
import pkg from '../../../package.json';

const Version = () => (
  <span className="dum-text">{pkg.version}</span>
);

export default Version;
