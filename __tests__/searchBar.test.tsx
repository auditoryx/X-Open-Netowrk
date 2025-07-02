import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/Explore/SearchBar';
import { getAvailableRoles, getAvailableGenres, getAvailableLocations } from '@/lib/firestore/searchCreators';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Firestore functions
jest.mock('@/lib/firestore/searchCreators', () => ({
  getAvailableRoles: jest.fn(),
  getAvailableGenres: jest.fn(),
  getAvailableLocations: jest.fn(),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <div data-testid="search-icon" />,
  XMarkIcon: () => <div data-testid="x-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-icon" />,
}));

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();
  const mockRouter = {
    push: jest.fn(),
  };
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Mock the Firestore functions
    (getAvailableRoles as jest.Mock).mockResolvedValue(['producer', 'singer', 'engineer']);
    (getAvailableGenres as jest.Mock).mockResolvedValue(['hip-hop', 'r&b', 'trap']);
    (getAvailableLocations as jest.Mock).mockResolvedValue(['New York', 'Los Angeles', 'London']);
  });

  test('renders search input and filter dropdowns', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText(/search creators/i)).toBeInTheDocument();
    expect(screen.getByText('Select Role')).toBeInTheDocument();
    expect(screen.getByText('Select Tags')).toBeInTheDocument();
    expect(screen.getByText('Select Location')).toBeInTheDocument();
  });

  test('calls onSearch when search term changes', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/search creators/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        searchTerm: 'test search',
        role: '',
        tags: [],
        location: ''
      });
    });
  });

  test('opens role dropdown when clicked', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const roleButton = screen.getByText('Select Role');
    fireEvent.click(roleButton);
    
    await waitFor(() => {
      expect(screen.getByText('producer')).toBeInTheDocument();
      expect(screen.getByText('singer')).toBeInTheDocument();
      expect(screen.getByText('engineer')).toBeInTheDocument();
    });
  });

  test('selects role and updates filters', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const roleButton = screen.getByText('Select Role');
    fireEvent.click(roleButton);
    
    await waitFor(() => {
      const producerOption = screen.getByText('producer');
      fireEvent.click(producerOption);
    });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        searchTerm: '',
        role: 'producer',
        tags: [],
        location: ''
      });
    });
  });

  test('displays active filters as chips', async () => {
    const initialFilters = {
      searchTerm: 'test',
      role: 'producer',
      tags: ['hip-hop'],
      location: 'New York'
    };
    
    render(<SearchBar onSearch={mockOnSearch} initialFilters={initialFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Role: producer')).toBeInTheDocument();
      expect(screen.getByText('hip-hop')).toBeInTheDocument();
      expect(screen.getByText('Location: New York')).toBeInTheDocument();
    });
  });

  test('clears all filters when clear button is clicked', async () => {
    const initialFilters = {
      searchTerm: 'test',
      role: 'producer',
      tags: ['hip-hop'],
      location: 'New York'
    };
    
    render(<SearchBar onSearch={mockOnSearch} initialFilters={initialFilters} />);
    
    await waitFor(() => {
      const clearButton = screen.getByTitle('Clear all filters');
      fireEvent.click(clearButton);
    });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        searchTerm: '',
        role: '',
        tags: [],
        location: ''
      });
    });
  });
});
