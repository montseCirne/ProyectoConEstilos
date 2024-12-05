"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidationResults = exports.validate = void 0;
const validator_1 = __importDefault(require("validator"));
// Función que genera el validador para un campo específico
const validate = (propName) => {
    const tests = {}; // Mapa de validaciones para el campo
    const handler = (req, resp, next) => {
        const vreq = req;
        if (!vreq.validation) {
            vreq.validation = { results: {}, valid: true }; // Inicializamos la validación si no existe
        }
        vreq.validation.results[propName] = { valid: true }; // Resultado por defecto como válido
        Object.keys(tests).forEach(k => {
            let valid = vreq.validation.results[propName][k] = tests[k](req.body?.[propName]);
            if (!valid) {
                vreq.validation.results[propName].valid = false;
                vreq.validation.valid = false; // Si alguna prueba falla, el campo no es válido
            }
        });
        next();
    };
    // Métodos para agregar pruebas de validación al handler
    handler.required = () => {
        tests.required = (val) => !validator_1.default.isEmpty(val, { ignore_whitespace: true });
        return handler;
    };
    handler.minLength = (min) => {
        tests.minLength = (val) => validator_1.default.isLength(val, { min });
        return handler;
    };
    handler.maxLength = (max) => {
        tests.maxLength = (val) => validator_1.default.isLength(val, { max });
        return handler;
    };
    handler.isNumber = () => {
        tests.isNumber = (val) => /^[0-9]+$/.test(val);
        return handler;
    };
    handler.isInteger = () => {
        tests.isInteger = (val) => validator_1.default.isInt(val);
        return handler;
    };
    handler.isText = () => {
        tests.isText = (val) => /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(val);
        return handler;
    };
    handler.isEmail = () => {
        tests.isEmail = (val) => validator_1.default.isEmail(val);
        return handler;
    };
    handler.greaterThan = (n) => {
        tests.greaterThan = (val) => {
            const num = parseInt(val); // Convertir el valor a número
            return !isNaN(num) && num > n; // Validar si es mayor que el valor dado
        };
        return handler;
    };
    handler.lessThan = (n) => {
        tests.lessThan = (val) => {
            const num = parseInt(val); // Convertir el valor a número
            return !isNaN(num) && num < n; // Validar si es menor que el valor dado
        };
        return handler;
    };
    return handler;
};
exports.validate = validate;
// Obtener los resultados de validación desde la solicitud
const getValidationResults = (req) => {
    return req.validation || { valid: true };
};
exports.getValidationResults = getValidationResults;
