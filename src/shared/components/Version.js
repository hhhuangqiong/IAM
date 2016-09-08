import React from 'react';
import pkg from '../../../package.json';

const Version = () => (
  <span className="dum-text">Ver. {pkg.version}</span>
);

export default Version;
