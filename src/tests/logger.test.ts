import { describe, it, expect, vi } from 'vitest';
import { logger } from '../utils/logger';

describe('logger', () => {
  it('logs debug messages to console.debug', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('test debug');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('DEBUG: test debug');
    spy.mockRestore();
  });

  it('logs info messages to console.info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test info');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('INFO: test info');
    spy.mockRestore();
  });

  it('logs warn messages to console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('test warn');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('WARN: test warn');
    spy.mockRestore();
  });

  it('logs error messages to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('ERROR: test error');
    spy.mockRestore();
  });

  it('includes context in log output', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('with context', { key: 'value' });
    expect(spy).toHaveBeenCalledWith(expect.any(String), { key: 'value' });
    spy.mockRestore();
  });

  it('includes ISO timestamp in log output', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('timestamp test');
    const output = spy.mock.calls[0][0] as string;
    // Should contain ISO timestamp pattern
    expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    spy.mockRestore();
  });
});
