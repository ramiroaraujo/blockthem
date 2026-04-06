import { createRoot } from 'react-dom/client'
import { Popup } from './Popup'

document.body.style.margin = '0'
document.body.style.padding = '0'

createRoot(document.getElementById('root')!).render(<Popup />)
