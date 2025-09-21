import React, { useState, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);





  return (
    <div
      ref={containerRef}
      className={clsx('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;
            
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hook for virtualized list utilities
export const useVirtualizedList = function<T>(_items: T[], itemHeight: number) {
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  return {
    containerRef,
    containerHeight,
    scrollToIndex,
  };
};

// Memoized list item wrapper
interface VirtualizedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export const VirtualizedListItem = React.memo(({ children, className = '' }: VirtualizedListItemProps) => (
  <div className={clsx('w-full', className)}>
    {children}
  </div>
));

VirtualizedListItem.displayName = 'VirtualizedListItem';

export default VirtualizedList;
