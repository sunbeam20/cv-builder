import { useEffect } from 'react'
import App from '../App'
import { HomePage } from './HomePage'
import { useHashRoute } from './useHashRoute'

export function Root() {
  const route = useHashRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  return route === 'app' ? <App /> : <HomePage />
}