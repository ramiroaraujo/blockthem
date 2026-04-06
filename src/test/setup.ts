import { chrome } from 'vitest-chrome'
import '@testing-library/jest-dom/vitest'

Object.assign(globalThis, { chrome })
