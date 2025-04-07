import * as ko from "knockout";
import { ValidationMessages } from "../components/users/validationMessages";

ko.extenders.passwordValidator = (target) => {
    target.extend({
        validation: {
            validator: (value) => {
                if (value.length < 8) {
                    return false;
                }
                const requiredCategories = 2;

                const uppercaseRegex = /[A-Z]/;
                const lowercaseRegex = /[a-z]/;
                const numbersRegex = /[0-9]/;
                const symbolsRegex = new RegExp("[!@#$%^&*()_+{}\\[\\]:;<>,.?~\\-]");

                let categories = 0;

                if (uppercaseRegex.test(value)) categories++;
                if (lowercaseRegex.test(value)) categories++;
                if (numbersRegex.test(value)) categories++;
                if (symbolsRegex.test(value)) categories++;

                return categories >= requiredCategories;
            },
            message: ValidationMessages.passwordCriteria
        }
    });

    return target;
};