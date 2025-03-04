import { ValidationError } from 'class-validator';

/**
 * Filter validation error from class-validator to a flat array of string
 * @param errors
 * @param parent
 * @returns string[]
 */
const filterValidationError = (
  errors: ValidationError[],
  parent: string = ''
): any[] => {
  // TODO: delete
  // console.log(errors);

  // each detail is each property
  const result = errors.map((detail) => {
    let propertyErrors: any[] = [];
    let childErrors: any[] = [];
    const prefix = parent ? `${parent}.` : '';

    // 1. propertyErrors
    // get error message (prefix + constraint) of this property first
    if (detail.constraints) {
      propertyErrors = Object.values(detail.constraints).map(
        (constraint) => prefix + constraint
      );
    }

    // 2. childErrors
    // get error message of children of this property next
    if (detail.children) {
      const childErrorArray = filterValidationError(
        detail.children,
        prefix + detail.property
      );
      childErrors = [...childErrorArray];
    }

    // return error [...1, ...2]
    return [...propertyErrors, ...childErrors];
  });

  return result.flat(Infinity);
};

export default filterValidationError;
