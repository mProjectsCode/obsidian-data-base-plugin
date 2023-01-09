import { trimString } from '../src/utils/Utils';

describe('trimString tests', () => {
	test('should remove single character string at beginning', () => {
		expect(trimString('"test', '"')).toEqual('test');
		expect(trimString('"""test', '"')).toEqual('test');
	});

	test('should remove single character string at end', () => {
		expect(trimString('test"', '"')).toEqual('test');
		expect(trimString('test"""', '"')).toEqual('test');
	});

	test('should remove single character string at beginning and end', () => {
		expect(trimString('"test"', '"')).toEqual('test');
		expect(trimString('""test"""', '"')).toEqual('test');
	});

	test('should remove multi character string at beginning', () => {
		expect(trimString('-=test', '-=')).toEqual('test');
		expect(trimString('-=-=-=test', '-=')).toEqual('test');
	});

	test('should remove multi character string at end', () => {
		expect(trimString('test-=', '-=')).toEqual('test');
		expect(trimString('test-=-=-=', '-=')).toEqual('test');
	});

	test('should remove multi character string at beginning and end', () => {
		expect(trimString('-=test-=', '-=')).toEqual('test');
		expect(trimString('-=-=test-=-=-=', '-=')).toEqual('test');
	});
});
