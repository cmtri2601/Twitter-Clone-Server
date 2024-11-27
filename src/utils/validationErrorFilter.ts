import { ValidationError } from 'class-validator';

/**
 * Filter validation error from class-validator to a flat array of string
 * @param details
 * @param parent
 * @returns string[]
 */
const filterValidationError = (
  details: ValidationError[],
  parent: string = ''
): any[] => {
  // TODO: delete
  // console.log(details);

  const result = details.map((detail) => {
    let propertyErrors: any[] = [];
    let childErrors: any[] = [];
    const prefix = parent ? `${parent}.` : '';

    // get error of properties of this instance first
    if (detail.constraints) {
      propertyErrors = Object.values(detail.constraints).map((constraint) => {
        return prefix + constraint;
      });
    }

    // get error of properties of this instance first
    if (detail.children) {
      const childErrorArray = filterValidationError(
        detail.children,
        prefix + detail.property
      );
      childErrors = [...childErrorArray];
    }

    // return error
    return [...propertyErrors, ...childErrors];
  });

  return result.flat(Infinity);
};

export default filterValidationError;
