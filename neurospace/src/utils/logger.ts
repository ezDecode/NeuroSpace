type Level = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';

function log(level: Level, ...args: any[]) {
	// In production, restrict debug logs
	if (!isDev && level === 'debug') return;
	// eslint-disable-next-line no-console
	console[level === 'debug' ? 'log' : level](...args);
}

export const logger = {
	debug: (...args: any[]) => log('debug', ...args),
	info: (...args: any[]) => log('info', ...args),
	warn: (...args: any[]) => log('warn', ...args),
	error: (...args: any[]) => log('error', ...args),
};