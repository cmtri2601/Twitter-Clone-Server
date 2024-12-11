/**
 * Test decorator
 * @param value test value
 * @returns
 */
export default function TestDecorator(value: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log('test decorator', value);
    const currentFunction = descriptor.value;
    const newFunction = async function (this: any, ...args: any) {
      console.log('call when start');
      const result = await currentFunction.call(this, ...args);
      console.log('call when done');
      return result;
    };
    descriptor.value = newFunction;
  };
}
