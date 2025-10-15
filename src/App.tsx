import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
const TrackerForm = lazy(() => import('./components/TrackerForm')) // Form for adding expenses
const TrackerChart = lazy(() => import('./components/TrackerChart')) // Chart for visualization

export default function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          Folio Fast Track
        </h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading Form...</div>}>
              <TrackerForm />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Expense Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading Chart...</div>}>
              <TrackerChart />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
