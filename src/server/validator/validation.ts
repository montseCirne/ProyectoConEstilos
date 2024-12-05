import { NextFunction, Request, Response } from "express";
import validator from "validator";

// Definimos un tipo para poder extender Request con la propiedad 'validation'
type ValidatedRequest = Request & {
  validation: {
    results: {
      [key: string]: {
        [key: string]: boolean;  // Mapa de pruebas y sus resultados
        valid: boolean;  // Resultado global para la propiedad
      };
    };
    valid: boolean;  // Resultado global de la validación
  };
};

// Función que genera el validador para un campo específico
export const validate = (propName: string) => {
  const tests: Record<string, (val: string) => boolean> = {};  // Mapa de validaciones para el campo
  const handler = (req: Request, resp: Response, next: NextFunction) => {
    const vreq = req as ValidatedRequest;
    if (!vreq.validation) {
      vreq.validation = { results: {}, valid: true };  // Inicializamos la validación si no existe
    }

    vreq.validation.results[propName] = { valid: true };  // Resultado por defecto como válido

    Object.keys(tests).forEach(k => {
      let valid = vreq.validation.results[propName][k] = tests[k](req.body?.[propName]);
      if (!valid) {
        vreq.validation.results[propName].valid = false;
        vreq.validation.valid = false;  // Si alguna prueba falla, el campo no es válido
      }
    });
    next();
  };

  // Métodos para agregar pruebas de validación al handler
  handler.required = () => {
    tests.required = (val: string) => !validator.isEmpty(val, { ignore_whitespace: true });
    return handler;
  };

  handler.minLength = (min: number) => {
    tests.minLength = (val: string) => validator.isLength(val, { min });
    return handler;
  };

  handler.maxLength = (max: number) => {
    tests.maxLength = (val: string) => validator.isLength(val, { max });
    return handler;
  };

  handler.isNumber = () => {
    tests.isNumber = (val: string) => /^[0-9]+$/.test(val);
    return handler;
  };

  handler.isInteger = () => {
    tests.isInteger = (val: string) => validator.isInt(val);
    return handler;
  };

  handler.isText = () => {
    tests.isText = (val: string) => /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(val);
    return handler;
  };

  handler.isEmail = () => {
    tests.isEmail = (val: string) => validator.isEmail(val);
    return handler;
  };

  handler.greaterThan = (n: number) => {
    tests.greaterThan = (val: string) => {
      const num = parseInt(val);  // Convertir el valor a número
      return !isNaN(num) && num > n;  // Validar si es mayor que el valor dado
    };
    return handler;
  };

  handler.lessThan = (n: number) => {
    tests.lessThan = (val: string) => {
      const num = parseInt(val);  // Convertir el valor a número
      return !isNaN(num) && num < n;  // Validar si es menor que el valor dado
    };
    return handler;
  };

  return handler;
};

// Obtener los resultados de validación desde la solicitud
export const getValidationResults = (req: Request) => {
  return (req as ValidatedRequest).validation || { valid: true };
};
