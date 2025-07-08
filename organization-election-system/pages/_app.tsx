import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { VotingProvider } from '../components/VotingContext'
import Notification from '../components/Notification'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <VotingProvider>
      <Notification />
      <Component {...pageProps} />
    </VotingProvider>
  )
}

export default MyApp 