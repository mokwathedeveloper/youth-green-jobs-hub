import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  loadingClassName?: string;
  errorClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  fallback,
  className = '',
  containerClassName = '',
  loadingClassName = '',
  errorClassName = '',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Preload image when in view
  useEffect(() => {
    if (isInView && !isLoaded && !isError) {
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = src;
    }
  }, [isInView, isLoaded, isError, src]);

  return (
    <div
      ref={containerRef}
      className={clsx('relative overflow-hidden', containerClassName)}
    >
      {/* Placeholder */}
      {!isLoaded && !isError && (
        <div
          className={clsx(
            'absolute inset-0 bg-gray-200 animate-pulse',
            loadingClassName
          )}
        >
          {placeholder && (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          )}
        </div>
      )}

      {/* Error fallback */}
      {isError && fallback && (
        <img
          src={fallback}
          alt={alt}
          className={clsx(className, errorClassName)}
          {...props}
        />
      )}

      {/* Main image */}
      {isInView && !isError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={clsx(
            className,
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
