const DOCS_ROOT = 'https://docs.livedigital.space/docs/web-sdk';

export const SOURCE_URL = 'https://github.com/VLprojects/examples/tree/master/web-sdk-react';

export const docsUrl = (page: string, anchor?: string) => `${DOCS_ROOT}/${page}${anchor ? `#${anchor}` : ''}`;

export const DOCS_URL = docsUrl('intro');
