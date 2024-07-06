import React from 'react';

const Markupiframe = ({ markupUrl, iframeRef }) => (
  <iframe
    ref={iframeRef}
    src={markupUrl}
    width="100%"
    height="1600px"
    title="Markup Iframe"
    style={{ border: 'none' }}
  />
);

export default Markupiframe;