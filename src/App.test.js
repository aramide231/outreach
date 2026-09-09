import { render, screen } from '@testing-library/react';
import App from './App';

test('renders outreach dashboard', () => {
  render(<App />);
  expect(screen.getByText(/Outreach/i)).toBeInTheDocument();
});
