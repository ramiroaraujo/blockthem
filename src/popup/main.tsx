import { createRoot } from 'react-dom/client';

import { getDir } from '../shared/i18n';
import { Popup } from './Popup';

import '../styles/tailwind.css';

document.documentElement.lang = chrome.i18n.getUILanguage();
document.documentElement.dir = getDir();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<Popup />);
