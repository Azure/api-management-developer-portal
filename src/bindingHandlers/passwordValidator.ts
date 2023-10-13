import * as ko from "knockout";
import { ValidationMessages } from "../components/users/validationMessages";
ko.extenders.passwordValidator = (target) => {
    target.extend({ 
        validation: {
            validator: (value) => {
                var minLength = 8;
                var requiredCategories = 2;
                var uppercaseRegex = /[A-Z]/;
                var lowercaseRegex = /[a-z]/;
                var numbersRegex = /[0-9]/;
                var symbolsRegex = new RegExp("[!@#$%^&*()_+{}\\[\\]:;<>,.?~\\-]");
                var categories = 0;
                if (uppercaseRegex.test(value)) categories++;
                if (lowercaseRegex.test(value)) categories++;
                if (numbersRegex.test(value)) categories++;
                if (symbolsRegex.test(value)) categories++;
                var isValid = value.length >= minLength && categories >= requiredCategories;
                return isValid;
            },
            message: ValidationMessages.passwordCriteria
        }
    });
    return target;
};