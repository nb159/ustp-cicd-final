import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2', 'py-1');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
  });

  it('should handle string classes', () => {
    const result = cn('flex items-center');
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
  });

  it('should exclude falsy conditional classes', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).not.toContain('active-class');
  });

  it('should merge tailwind conflicting utilities', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle array of classes', () => {
    const result = cn(['flex', 'items-center'], 'justify-between');
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-between');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null', () => {
    const result = cn('base-class', undefined, null);
    expect(result).toContain('base-class');
  });

  it('should handle complex conditional logic', () => {
    const variant = 'primary';
    const result = cn(
      'base',
      variant === 'primary' && 'bg-blue',
      variant === 'secondary' && 'bg-gray'
    );
    expect(result).toContain('base');
    expect(result).toContain('bg-blue');
    expect(result).not.toContain('bg-gray');
  });
});
