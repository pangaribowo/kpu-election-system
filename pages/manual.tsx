import ManualSection from '../components/ManualSection'
import { FiBookOpen } from 'react-icons/fi'

const ManualPage = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-6 py-4">
      <h1 className="section-title text-3xl font-bold text-blue-700 dark:text-blue-300 mb-6 flex items-center justify-center gap-2">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-1">
          <FiBookOpen className="text-blue-500 dark:text-blue-400" size={24} />
        </span>
        <span className="drop-shadow-sm">MANUAL PENGGUNAAN</span>
      </h1>
      <div className="mt-2 rounded-xl bg-gray-50 dark:bg-gray-800">
        <ManualSection />
      </div>
    </div>
  )
}
 
export default ManualPage 