jquery.easy-validation.js
=========================

A simple polyfill for HTML5 based validation

The API
-------

Our validation strategy involves using an HTML5-aware browser’s built-in 
validation mechanism, falling back to a JavaScript-based validation scheme
in non HTML5-aware browsers, and finally degrading to server-side validation 
in non-JavaScript scenarios. HTML5 supports field validation using a few 
mechanisms, two of which we commonly use:

 - The `required` attribute indicates a field is required
 - The `pattern` attribute allows you to indicate a regular expression for matching 
   against the supplied content

Using a few custom `data-*` attributes, you can tailor the error messages 
provided to users via browser or JavaScript based validation for forms as a 
whole or individual fields:

 - The `data-validation-error-empty` attribute
   When used on a form, it prescribes a global default message for all fields 
   that are invalid when empty; when used on a field, it provides a field-specific
   error message when empty.
 - The `data-validation-error-invalid` attribute
   When used on a form, it prescribes a global default message for all fields that 
   are invalid; when used on a field, it provides a field-specific error message when invalid.
