import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetch, useParallelFetch, useInfiniteScroll } from '../useFetch';
import type { ApiError } from '../../services/api';

// Mock the useApiCache hook
jest.mock('../useLocalStorage', () => ({
  useApiCache: jest.fn(() => ({
    data: null,
    isExpired: true,
    setData: jest.fn(),
    clearCache: jest.fn(),
  })),
}));

describe('useFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetch = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useFetch(mockFetch, { immediate: true })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch errors', async () => {
    const mockError: ApiError = {
      message: 'Network error',
      status: 500,
    };
    const mockFetch = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useFetch(mockFetch, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('should retry on failure', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useFetch(mockFetch, {
        immediate: true,
        retryAttempts: 3,
        retryDelay: 10, // Short delay for testing
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should transform data when transform function is provided', async () => {
    const mockData = { id: 1, name: 'Test' };
    const transformedData = { ...mockData, transformed: true };
    const mockFetch = jest.fn().mockResolvedValue(mockData);
    const transform = jest.fn().mockReturnValue(transformedData);

    const { result } = renderHook(() =>
      useFetch(mockFetch, { immediate: true, transform })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(transformedData);
    expect(transform).toHaveBeenCalledWith(mockData);
  });

  it('should call success and error callbacks', async () => {
    const mockData = { id: 1, name: 'Test' };
    const onSuccess = jest.fn();
    const onError = jest.fn();

    // Test success callback
    const mockFetchSuccess = jest.fn().mockResolvedValue(mockData);
    const { result: successResult } = renderHook(() =>
      useFetch(mockFetchSuccess, { immediate: true, onSuccess, onError })
    );

    await waitFor(() => {
      expect(successResult.current.loading).toBe(false);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
    expect(onError).not.toHaveBeenCalled();

    // Test error callback
    const mockError = new Error('Test error');
    const mockFetchError = jest.fn().mockRejectedValue(mockError);
    const { result: errorResult } = renderHook(() =>
      useFetch(mockFetchError, { immediate: true, onSuccess, onError })
    );

    await waitFor(() => {
      expect(errorResult.current.loading).toBe(false);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should execute manually when immediate is false', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetch = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useFetch(mockFetch, { immediate: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(mockFetch).not.toHaveBeenCalled();

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should reset state', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetch = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useFetch(mockFetch, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });
});

describe('useParallelFetch', () => {
  it('should fetch multiple resources in parallel', async () => {
    const mockData1 = { id: 1, name: 'Test1' };
    const mockData2 = { id: 2, name: 'Test2' };
    const mockFetch1 = jest.fn().mockResolvedValue(mockData1);
    const mockFetch2 = jest.fn().mockResolvedValue(mockData2);

    const fetchFunctions = {
      resource1: mockFetch1,
      resource2: mockFetch2,
    };

    const { result } = renderHook(() =>
      useParallelFetch(fetchFunctions, { immediate: true })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      resource1: mockData1,
      resource2: mockData2,
    });
    expect(result.current.success).toBe(true);
    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });

  it('should handle partial failures', async () => {
    const mockData1 = { id: 1, name: 'Test1' };
    const mockError = new Error('Fetch error');
    const mockFetch1 = jest.fn().mockResolvedValue(mockData1);
    const mockFetch2 = jest.fn().mockRejectedValue(mockError);

    const fetchFunctions = {
      resource1: mockFetch1,
      resource2: mockFetch2,
    };

    const { result } = renderHook(() =>
      useParallelFetch(fetchFunctions, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      resource1: mockData1,
    });
    expect(result.current.success).toBe(false);
    expect(result.current.errors).toEqual({
      resource2: mockError,
    });
  });
});

describe('useInfiniteScroll', () => {
  it('should load initial data', async () => {
    const mockData = {
      results: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
      hasMore: true,
    };
    const mockFetch = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useInfiniteScroll(mockFetch)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData.results);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.page).toBe(2); // Next page
    expect(mockFetch).toHaveBeenCalledWith(1, 20); // Initial page, default page size
  });

  it('should load more data', async () => {
    const mockData1 = {
      results: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
      hasMore: true,
    };
    const mockData2 = {
      results: [{ id: 3, name: 'Item 3' }, { id: 4, name: 'Item 4' }],
      hasMore: false,
    };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result } = renderHook(() =>
      useInfiniteScroll(mockFetch)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1.results);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.loadingMore).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    expect(result.current.data).toEqual([
      ...mockData1.results,
      ...mockData2.results,
    ]);
    expect(result.current.hasMore).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(2, 2, 20);
  });

  it('should refresh data', async () => {
    const mockData1 = {
      results: [{ id: 1, name: 'Item 1' }],
      hasMore: true,
    };
    const mockData2 = {
      results: [{ id: 2, name: 'Item 2' }],
      hasMore: false,
    };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result } = renderHook(() =>
      useInfiniteScroll(mockFetch)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1.results);

    act(() => {
      result.current.refresh();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData2.results);
    expect(result.current.page).toBe(2); // Reset to next page after initial
  });
});
