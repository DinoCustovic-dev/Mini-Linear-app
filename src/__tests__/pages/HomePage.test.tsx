import { render, screen } from '@testing-library/react';

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the placeholder', () => {
    render(<HomePage />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
