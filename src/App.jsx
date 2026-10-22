import { BrowserRouter } from '@/adapters/router';
import { AppRoutes } from '@/routes/AppRoutes.jsx';

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
