import { createRoot } from 'react-dom/client';

import { Popup } from './Popup';

document.body.style.margin = '0';
document.body.style.padding = '0';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<Popup />);
