import { createRoot } from 'react-dom/client';

import { Popup } from './Popup';

import '../styles/tailwind.css';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<Popup />);
